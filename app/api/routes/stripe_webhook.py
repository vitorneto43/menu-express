from decimal import Decimal
import stripe

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.courier import Courier

router = APIRouter(prefix="/stripe", tags=["Stripe Webhook"])

stripe.api_key = settings.STRIPE_SECRET_KEY


def transfer_after_payment(order: Order, restaurant: Restaurant, courier: Courier | None):
    if not order.stripe_charge_id:
        raise ValueError("Pedido sem charge Stripe")

    if restaurant.stripe_account_id and Decimal(str(order.restaurant_amount)) > 0:
        stripe.Transfer.create(
            amount=int(Decimal(str(order.restaurant_amount)) * 100),
            currency="brl",
            destination=restaurant.stripe_account_id,
            source_transaction=order.stripe_charge_id,
            transfer_group=order.transfer_group,
            metadata={
                "order_id": str(order.id),
                "type": "restaurant",
            },
        )

    if (
        courier
        and order.partner_delivery
        and courier.stripe_account_id
        and Decimal(str(order.courier_amount)) > 0
    ):
        stripe.Transfer.create(
            amount=int(Decimal(str(order.courier_amount)) * 100),
            currency="brl",
            destination=courier.stripe_account_id,
            source_transaction=order.stripe_charge_id,
            transfer_group=order.transfer_group,
            metadata={
                "order_id": str(order.id),
                "type": "courier",
            },
        )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        return JSONResponse(status_code=400, content={"detail": "Payload inválido"})
    except stripe.error.SignatureVerificationError:
        return JSONResponse(status_code=400, content={"detail": "Assinatura inválida"})

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]

        order_id = session_obj.get("metadata", {}).get("order_id")
        payment_intent_id = session_obj.get("payment_intent")

        if order_id and payment_intent_id:
            db: Session = SessionLocal()
            try:
                order = db.get(Order, int(order_id))

                if order and order.transfer_status != "completed":
                    payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

                    order.stripe_payment_intent_id = payment_intent.id
                    order.transfer_group = payment_intent.transfer_group or f"ORDER_{order.id}"

                    charges = payment_intent.get("charges", {}).get("data", [])
                    if charges:
                        order.stripe_charge_id = charges[0]["id"]

                    restaurant = db.get(Restaurant, order.restaurant_id)
                    courier = db.get(Courier, order.courier_id) if order.courier_id else None

                    if restaurant:
                        transfer_after_payment(order, restaurant, courier)
                        order.transfer_status = "completed"
                        order.status = "accepted"
                        db.commit()
            finally:
                db.close()

    return {"received": True}