from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order
from app.models.review import Review
from app.schemas.review import ReviewCreate

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/")
def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    order = db.get(Order, data.order_id)

    if not order or order.status != "delivered":
        raise HTTPException(status_code=400, detail="Pedido não finalizado")

    existing = db.query(Review).filter_by(order_id=data.order_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pedido já avaliado")

    review = Review(**data)
    db.add(review)
    db.commit()

    return review