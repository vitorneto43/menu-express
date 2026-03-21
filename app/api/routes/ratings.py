from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order
from app.models.restaurant import Restaurant

router = APIRouter(prefix="/ratings", tags=["Ratings"])


class RatingPayload(BaseModel):
    order_id: int
    stars: int
    review: str | None = None


@router.post("/")
def rate_restaurant(payload: RatingPayload, db: Session = Depends(get_db)):
    # validação
    if payload.stars < 1 or payload.stars > 5:
        raise HTTPException(status_code=400, detail="A nota deve ser entre 1 e 5")

    order = db.get(Order, payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Só pode avaliar pedidos entregues")

    if order.customer_rating is not None:
        raise HTTPException(status_code=400, detail="Pedido já avaliado")

    restaurant = db.get(Restaurant, order.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    # salva avaliação no pedido
    order.customer_rating = payload.stars
    order.customer_review = payload.review

    # atualiza média do restaurante
    restaurant.rating_total = (restaurant.rating_total or 0) + payload.stars
    restaurant.rating_count = (restaurant.rating_count or 0) + 1
    restaurant.rating_average = round(
        restaurant.rating_total / restaurant.rating_count, 2
    )

    db.commit()

    return {
        "message": "Avaliação registrada com sucesso",
        "rating_average": float(restaurant.rating_average),
        "rating_count": restaurant.rating_count,
    }