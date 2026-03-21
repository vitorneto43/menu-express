from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.schemas.product import ProductOut

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = Path("/var/www/menuexpress/uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_image(image: UploadFile | None) -> str | None:
    if image is None:
        return None

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo enviado deve ser uma imagem")

    extension = Path(image.filename).suffix.lower() if image.filename else ".jpg"
    if not extension:
        extension = ".jpg"

    filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / filename

    content = image.file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return f"/uploads/products/{filename}"


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    restaurant_id: int = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    price: float = Form(...),
    category: str | None = Form(None),
    available: bool = Form(True),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    image_url = save_uploaded_image(image)

    product = Product(
        restaurant_id=restaurant_id,
        name=name,
        description=description,
        price=price,
        image=image_url,
        category=category,
        available=available,
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