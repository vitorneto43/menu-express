from decimal import Decimal

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.stripe_config import stripe  # noqa
from app.db.session import get_db
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.courier import Courier
from app.services.stripe_service import create_payment_intent_for_order, transfer_after_payment

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create-payment-intent/{order_id}")
def create_order_payment_intent(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if not order.transfer_group:
        order.transfer_group = f"ORDER_{order.id}"

    payment_intent = create_payment_intent_for_order(order)
    order.stripe_payment_intent_id = payment_intent.id
    db.commit()
    db.refresh(order)

    return {
        "client_secret": payment_intent.client_secret,
        "payment_intent_id": payment_intent.id,
        "order_id": order.id,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
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

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        order_id = payment_intent["metadata"].get("order_id")
        if order_id:
            order = db.get(Order, int(order_id))
            if order and order.transfer_status != "completed":
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

    return {"received": True}