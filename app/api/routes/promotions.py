from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.promotion import Promotion
from app.models.restaurant import Restaurant
from app.models.product import Product
from app.schemas.promotion import PromotionCreate, PromotionUpdate

router = APIRouter(prefix="/promotions", tags=["Promotions"])


def serialize_promotion(promotion: Promotion):
    return {
        "id": promotion.id,
        "restaurant_id": promotion.restaurant_id,
        "product_id": promotion.product_id,
        "title": promotion.title,
        "description": promotion.description,
        "promotional_price": float(promotion.promotional_price) if promotion.promotional_price is not None else None,
        "banner_url": promotion.banner_url,
        "active": promotion.active,
        "created_at": promotion.created_at,
        "restaurant_name": promotion.restaurant.name if promotion.restaurant else None,
        "product_name": promotion.product.name if promotion.product else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_promotion(data: PromotionCreate, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, data.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    if data.product_id is not None:
        product = db.get(Product, data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        if product.restaurant_id != data.restaurant_id:
            raise HTTPException(
                status_code=400,
                detail="O produto informado não pertence a este restaurante",
            )

    promotion = Promotion(
        restaurant_id=data.restaurant_id,
        product_id=data.product_id,
        title=data.title,
        description=data.description,
        promotional_price=data.promotional_price,
        banner_url=data.banner_url,
        active=data.active if data.active is not None else True,
    )

    db.add(promotion)
    db.commit()
    db.refresh(promotion)

    promotion = (
        db.query(Promotion)
        .options(
            joinedload(Promotion.restaurant),
            joinedload(Promotion.product),
        )
        .filter(Promotion.id == promotion.id)
        .first()
    )

    return serialize_promotion(promotion)


@router.get("")
def list_promotions(db: Session = Depends(get_db)):
    promotions = (
        db.query(Promotion)
        .options(
            joinedload(Promotion.restaurant),
            joinedload(Promotion.product),
        )
        .order_by(Promotion.id.desc())
        .all()
    )

    return [serialize_promotion(promotion) for promotion in promotions]


@router.get("/restaurant/{restaurant_id}")
def list_promotions_by_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    promotions = (
        db.query(Promotion)
        .options(
            joinedload(Promotion.restaurant),
            joinedload(Promotion.product),
        )
        .filter(Promotion.restaurant_id == restaurant_id)
        .order_by(Promotion.id.desc())
        .all()
    )

    return [serialize_promotion(promotion) for promotion in promotions]


@router.get("/active")
def list_active_promotions(db: Session = Depends(get_db)):
    promotions = (
        db.query(Promotion)
        .options(
            joinedload(Promotion.restaurant),
            joinedload(Promotion.product),
        )
        .filter(Promotion.active == True)
        .order_by(Promotion.id.desc())
        .all()
    )

    return [serialize_promotion(promotion) for promotion in promotions]


@router.get("/{promotion_id}")
def get_promotion(promotion_id: int, db: Session = Depends(get_db)):
    promotion = (
        db.query(Promotion)
        .options(
            joinedload(Promotion.restaurant),
            joinedload(Promotion.product),
        )
        .filter(Promotion.id == promotion_id)
        .first()
    )

    if not promotion:
        raise HTTPException(status_code=404, detail="Promoção não encontrada")

    return serialize_promotion(promotion)


@router.put("/{promotion_id}")
def update_promotion(promotion_id: int, data: PromotionUpdate, db: Session = Depends(get_db)):
    promotion = db.get(Promotion, promotion_id)
    if not promotion:
        raise HTTPException(status_code=404, detail="Promoção não encontrada")

    update_data = data.model_dump(exclude_unset=True)

    if "product_id" in update_data and update_data["product_id"] is not None:
        product = db.get(Product, update_data["product_id"])
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        if product.restaurant_id != promotion.restaurant_id:
            raise HTTPException(
                status_code=400,
                detail="O produto informado não pertence ao restaurante da promoção",
            )

    for field, value in update_data.items():
        setattr(promotion, field, value)

    db.commit()
    db.refresh(promotion)

    promotion = (
        db.query(Promotion)
        .options(
            joinedload(Promotion.restaurant),
            joinedload(Promotion.product),
        )
        .filter(Promotion.id == promotion.id)
        .first()
    )

    return serialize_promotion(promotion)


@router.delete("/{promotion_id}", status_code=status.HTTP_200_OK)
def delete_promotion(promotion_id: int, db: Session = Depends(get_db)):
    promotion = db.get(Promotion, promotion_id)
    if not promotion:
        raise HTTPException(status_code=404, detail="Promoção não encontrada")

    db.delete(promotion)
    db.commit()

    return {"detail": "Promoção removida com sucesso"}