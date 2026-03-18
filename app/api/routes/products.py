from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.schemas.product import ProductCreate, ProductOut

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, data.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    product = Product(
        restaurant_id=data.restaurant_id,
        name=data.name,
        description=data.description,
        price=data.price,
        image=data.image,
        available=data.available,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = db.execute(select(Product)).scalars().all()
    return products


@router.get("/restaurant/{restaurant_id}", response_model=list[ProductOut])
def list_products_by_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    products = db.execute(
        select(Product).where(Product.restaurant_id == restaurant_id)
    ).scalars().all()
    return products