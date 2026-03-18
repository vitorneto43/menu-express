from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.courier import Courier
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


def serialize_restaurant(restaurant: Restaurant | None):
    if not restaurant:
        return None

    return {
        "id": restaurant.id,
        "user_id": restaurant.user_id,
        "name": restaurant.name,
        "owner_name": restaurant.owner_name,
        "description": restaurant.description,
        "image": restaurant.image,
        "phone": restaurant.phone,
        "delivery_fee": float(restaurant.delivery_fee or 0),
        "pix_key": restaurant.pix_key,
        "bank_name": restaurant.bank_name,
        "account_type": restaurant.account_type,
        "agency": restaurant.agency,
        "account_number": restaurant.account_number,
        "document_number": restaurant.document_number,
        "stripe_account_id": restaurant.stripe_account_id,
        "stripe_onboarding_complete": restaurant.stripe_onboarding_complete,
    }


def serialize_courier(courier: Courier | None):
    if not courier:
        return None

    return {
        "id": courier.id,
        "user_id": courier.user_id,
        "vehicle_type": courier.vehicle_type,
        "active": courier.active,
        "stripe_account_id": courier.stripe_account_id,
        "stripe_onboarding_complete": courier.stripe_onboarding_complete,
    }


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    print("=== REGISTER INICIO ===")
    print("email:", user_in.email)
    print("role:", user_in.role)

    existing = db.execute(
        select(User).where(User.email == user_in.email)
    ).scalar_one_or_none()

    print("=== REGISTER CHECK EMAIL ===", existing)

    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    hashed = hash_password(user_in.password)
    print("=== SENHA HASH GERADA ===")

    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed,
        role=user_in.role,
        is_active=True,
    )

    db.add(user)
    print("=== USER ADICIONADO NA SESSION ===")

    db.commit()
    print("=== COMMIT OK ===")

    db.refresh(user)
    print("=== REFRESH OK ===")

    return user



@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(User.email == data.email)
    ).scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    restaurant = db.execute(
        select(Restaurant).where(Restaurant.user_id == user.id)
    ).scalar_one_or_none()

    courier = db.execute(
        select(Courier).where(Courier.user_id == user.id)
    ).scalar_one_or_none()

    token = create_access_token(str(user.id))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "restaurantProfile": serialize_restaurant(restaurant),
            "courierProfile": serialize_courier(courier),
        }
    }