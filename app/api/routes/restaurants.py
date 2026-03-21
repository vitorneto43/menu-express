from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.restaurant import Restaurant

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

UPLOAD_DIR = Path("uploads/restaurants")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_image(image: UploadFile | None) -> str | None:
    if image is None:
        return None

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo enviado deve ser uma imagem")

    extension = Path(image.filename).suffix.lower() if image.filename else ".jpg"
    filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as f:
        f.write(image.file.read())

    return f"/uploads/restaurants/{filename}"


def serialize_restaurant(restaurant: Restaurant):
    return {
        "id": restaurant.id,
        "user_id": restaurant.user_id,
        "name": restaurant.name,
        "owner_name": restaurant.owner_name,
        "description": restaurant.description,
        "image": restaurant.image,
        "phone": restaurant.phone,
        "category": restaurant.category,
        "delivery_fee": float(restaurant.delivery_fee or 0),
        "address": {
            "street": restaurant.address_street,
            "number": restaurant.address_number,
            "neighborhood": restaurant.address_neighborhood,
            "city": restaurant.address_city,
            "state": restaurant.address_state,
            "cep": restaurant.address_cep,
        },
        "latitude": float(restaurant.latitude) if restaurant.latitude is not None else None,
        "longitude": float(restaurant.longitude) if restaurant.longitude is not None else None,
        "pix_key": restaurant.pix_key,
        "bank_name": restaurant.bank_name,
        "account_type": restaurant.account_type,
        "agency": restaurant.agency,
        "account_number": restaurant.account_number,
        "document_number": restaurant.document_number,
        "stripe_account_id": restaurant.stripe_account_id,
        "stripe_onboarding_complete": restaurant.stripe_onboarding_complete,

        # ⭐ ESTRELAS (ADICIONAR AQUI)
        "rating_average": float(restaurant.rating_average or 0),
        "rating_count": restaurant.rating_count or 0,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_restaurant(
    user_id: int = Form(...),
    name: str = Form(...),
    owner_name: str | None = Form(None),
    description: str | None = Form(None),
    phone: str | None = Form(None),
    category: str | None = Form(None),
    address_street: str | None = Form(None),
    address_number: str | None = Form(None),
    address_neighborhood: str | None = Form(None),
    address_city: str | None = Form(None),
    address_state: str | None = Form(None),
    address_cep: str | None = Form(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    delivery_fee: float = Form(0),
    pix_key: str | None = Form(None),
    bank_name: str | None = Form(None),
    account_type: str | None = Form(None),
    agency: str | None = Form(None),
    account_number: str | None = Form(None),
    document_number: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    image_url = save_uploaded_image(image)

    restaurant = Restaurant(
        user_id=user_id,
        name=name,
        owner_name=owner_name,
        description=description,
        image=image_url,
        phone=phone,
        category=category,
        address_street=address_street,
        address_number=address_number,
        address_neighborhood=address_neighborhood,
        address_city=address_city,
        address_state=address_state,
        address_cep=address_cep,
        latitude=latitude,
        longitude=longitude,
        delivery_fee=delivery_fee,
        pix_key=pix_key,
        bank_name=bank_name,
        account_type=account_type,
        agency=agency,
        account_number=account_number,
        document_number=document_number,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return serialize_restaurant(restaurant)


@router.get("")
def list_restaurants(db: Session = Depends(get_db)):
    print("=== LISTANDO RESTAURANTES ===")
    restaurants = db.execute(select(Restaurant)).scalars().all()
    print("TOTAL:", len(restaurants))
    return [serialize_restaurant(r) for r in restaurants]


@router.get("/user/{user_id}")
def get_restaurant_by_user(user_id: int, db: Session = Depends(get_db)):
    restaurant = db.execute(
        select(Restaurant).where(Restaurant.user_id == user_id)
    ).scalar_one_or_none()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Usuário não possui restaurante")

    return serialize_restaurant(restaurant)


@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return serialize_restaurant(restaurant)