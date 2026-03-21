from decimal import Decimal
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order

router = APIRouter(prefix="/payments", tags=["Payments"])
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/pix/{order_id}")
def create_pix_payment(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    amount = int((Decimal(str(order.total)) * 100).quantize(Decimal("1")))

    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="brl",
        payment_method_types=["pix"],
        description=f"Pedido #{order.id} - Menu Express",
        metadata={
            "order_id": str(order.id),
            "restaurant_id": str(order.restaurant_id),
        },
    )

    order.payment_method = "pix"
    # Se você tiver colunas para salvar ids externos, salve aqui:
    # order.stripe_payment_intent_id = intent.id

    db.commit()
    db.refresh(order)

    next_action = intent.get("next_action", {}) or {}
    pix_data = next_action.get("pix_display_qr_code", {}) or {}

    return {
        "payment_intent_id": intent.id,
        "hosted_instructions_url": pix_data.get("hosted_instructions_url"),
        "qr_code_png": pix_data.get("image_url_png"),
        "qr_code_svg": pix_data.get("image_url_svg"),
        "expires_at": pix_data.get("expires_at"),
        "amount": order.total,
    }