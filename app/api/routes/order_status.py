from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order

router = APIRouter(prefix="/orders", tags=["Order Status"])


class UpdateOrderStatus(BaseModel):
    status: str


VALID_STATUS = {
    "pending",
    "accepted",
    "preparing",
    "ready",
    "on_the_way",
    "delivered",
    "cancelled",
}


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, data: UpdateOrderStatus, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if data.status not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="Status inválido")

    order.status = data.status
    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "status": order.status,
    }