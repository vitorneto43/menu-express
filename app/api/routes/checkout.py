import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order

router = APIRouter(prefix="/checkout", tags=["Checkout"])

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/session/{order_id}")
def create_checkout_session(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    transfer_group = order.transfer_group or f"ORDER_{order.id}"

    session = stripe.checkout.Session.create(
        mode="payment",
        success_url=f"{settings.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_URL}/checkout",
        client_reference_id=str(order.id),
        line_items=[
            {
                "price_data": {
                    "currency": "brl",
                    "product_data": {
                        "name": f"Pedido #{order.id} - Menu Express",
                    },
                    "unit_amount": int(float(order.total) * 100),
                },
                "quantity": 1,
            }
        ],
        metadata={
            "order_id": str(order.id),
            "restaurant_id": str(order.restaurant_id),
            "courier_id": str(order.courier_id) if order.courier_id else "",
        },
        payment_intent_data={
            "transfer_group": transfer_group,
            "metadata": {
                "order_id": str(order.id),
                "restaurant_id": str(order.restaurant_id),
                "courier_id": str(order.courier_id) if order.courier_id else "",
            },
        },
    )

    order.transfer_group = transfer_group
    db.commit()
    db.refresh(order)

    return {
        "checkout_url": session.url,
        "session_id": session.id,
    }