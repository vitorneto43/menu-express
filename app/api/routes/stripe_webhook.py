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

    if restaurant.stripe_account_id and Decimal(str(order.restaurant_amount or 0)) > 0:
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
        and Decimal(str(order.courier_amount or 0)) > 0
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


def get_charge_id_from_payment_intent(payment_intent_id: str) -> str | None:
    payment_intent = stripe.PaymentIntent.retrieve(
        payment_intent_id,
        expand=["latest_charge"],
    )

    latest_charge = payment_intent.get("latest_charge")
    if latest_charge:
        if isinstance(latest_charge, dict):
            return latest_charge.get("id")
        return latest_charge

    charges = stripe.Charge.list(payment_intent=payment_intent_id, limit=1)
    if charges and charges.data:
        return charges.data[0].id

    return None


def process_paid_order(order_id: int, payment_intent_id: str):
    db: Session = SessionLocal()
    try:
        order = db.get(Order, order_id)

        if not order:
            return JSONResponse(
                status_code=404,
                content={"detail": "Pedido não encontrado"},
            )

        if order.transfer_status == "completed":
            return {"received": True, "detail": "Webhook já processado"}

        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        charge_id = get_charge_id_from_payment_intent(payment_intent_id)

        if not charge_id:
            return JSONResponse(
                status_code=400,
                content={"detail": "Charge do pagamento não encontrada"},
            )

        order.stripe_payment_intent_id = payment_intent.id
        order.transfer_group = payment_intent.get("transfer_group") or f"ORDER_{order.id}"
        order.stripe_charge_id = charge_id

        restaurant = db.get(Restaurant, order.restaurant_id)
        courier = db.get(Courier, order.courier_id) if order.courier_id else None

        if not restaurant:
            return JSONResponse(
                status_code=404,
                content={"detail": "Restaurante não encontrado"},
            )

        transfer_after_payment(order, restaurant, courier)

        order.transfer_status = "completed"
        order.status = "accepted"

        db.commit()
        return {"received": True, "detail": "Pedido processado com sucesso"}

    except stripe.error.StripeError as e:
        db.rollback()
        return JSONResponse(
            status_code=400,
            content={"detail": f"Erro Stripe: {str(e)}"},
        )
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Erro interno: {str(e)}"},
        )
    finally:
        db.close()


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        return JSONResponse(
            status_code=400,
            content={"detail": "Cabeçalho stripe-signature ausente"},
        )

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
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"detail": f"Erro ao validar webhook: {str(e)}"},
        )

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        metadata = obj.get("metadata", {}) or {}
        order_id = metadata.get("order_id") or obj.get("client_reference_id")
        payment_intent_id = obj.get("payment_intent")

        if not order_id or not payment_intent_id:
            return JSONResponse(
                status_code=400,
                content={"detail": "order_id ou payment_intent ausente"},
            )

        return {
            "received": True,
            "detail": "Checkout concluído, aguardando payment_intent.succeeded",
        }

    if event_type == "payment_intent.succeeded":
        metadata = obj.get("metadata", {}) or {}
        order_id = metadata.get("order_id")
        payment_intent_id = obj.get("id")

        if not order_id or not payment_intent_id:
            return JSONResponse(
                status_code=400,
                content={"detail": "order_id ou payment_intent ausente no PaymentIntent"},
            )

        return process_paid_order(int(order_id), payment_intent_id)

    if event_type == "payment_intent.payment_failed":
        metadata = obj.get("metadata", {}) or {}
        order_id = metadata.get("order_id")

        if order_id:
            db: Session = SessionLocal()
            try:
                order = db.get(Order, int(order_id))
                if order:
                    order.status = "cancelled"
                    db.commit()
            finally:
                db.close()

        return {"received": True, "detail": "Pagamento falhou"}

    return {"received": True}