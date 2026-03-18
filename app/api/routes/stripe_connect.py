from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.courier import Courier
from app.models.user import User
from app.services.stripe_connect import (
    create_restaurant_connected_account,
    create_courier_connected_account,
    create_onboarding_link,
)

router = APIRouter(prefix="/stripe/connect", tags=["Stripe Connect"])


@router.post("/restaurant/{restaurant_id}/onboard")
def onboard_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    owner_email = None
    if restaurant.user_id:
        user = db.get(User, restaurant.user_id)
        owner_email = user.email if user else None

    if not restaurant.stripe_account_id:
        account = create_restaurant_connected_account(owner_email)
        restaurant.stripe_account_id = account.id
        db.commit()
        db.refresh(restaurant)

    link = create_onboarding_link(restaurant.stripe_account_id)

    return {
        "stripe_account_id": restaurant.stripe_account_id,
        "onboarding_url": link.url,
    }


@router.post("/courier/{courier_id}/onboard")
def onboard_courier(courier_id: int, db: Session = Depends(get_db)):
    courier = db.get(Courier, courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Entregador não encontrado")

    email = None
    full_name = None

    if courier.user_id:
        user = db.get(User, courier.user_id)
        if user:
            email = user.email
            full_name = user.name

    if not courier.stripe_account_id:
        account = create_courier_connected_account(
            email=email,
            full_name=full_name,
            phone=courier.phone,
        )
        courier.stripe_account_id = account.id
        db.commit()
        db.refresh(courier)

    link = create_onboarding_link(courier.stripe_account_id)

    return {
        "stripe_account_id": courier.stripe_account_id,
        "onboarding_url": link.url,
    }
