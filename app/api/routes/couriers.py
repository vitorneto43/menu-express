import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.courier import Courier
from app.models.user import User

router = APIRouter(prefix="/couriers", tags=["Couriers"])

UPLOAD_DIR = "uploads/couriers"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_photo(photo: UploadFile | None) -> str | None:
    if not photo:
        return None

    ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
    filename = f"{uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    return filepath.replace("\\", "/")


def serialize_courier(courier: Courier):
    return {
        "id": courier.id,
        "user_id": courier.user_id,
        "name": courier.name,
        "phone": courier.phone,
        "vehicle_type": courier.vehicle_type,
        "bank_name": courier.bank_name,
        "account_type": courier.account_type,
        "agency": courier.agency,
        "account_number": courier.account_number,
        "pix_key": courier.pix_key,
        "document_number": courier.document_number,
        "photo": courier.photo,
        "active": courier.active,
        "stripe_account_id": courier.stripe_account_id,
        "stripe_onboarding_complete": courier.stripe_onboarding_complete,
        "created_at": courier.created_at,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_courier(
    user_id: int = Form(...),
    name: str = Form(...),
    phone: str = Form(...),
    vehicle: str = Form(...),
    bank: str = Form(...),
    account_type: str = Form(...),
    agency: str = Form(...),
    account_number: str = Form(...),
    pix_key: str = Form(...),
    document: str = Form(...),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    existing = db.query(Courier).filter(Courier.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Usuário já possui cadastro de entregador")

    photo_path = save_photo(photo)

    courier = Courier(
        user_id=user_id,
        name=name,
        phone=phone,
        vehicle_type=vehicle,
        bank_name=bank,
        account_type=account_type,
        agency=agency,
        account_number=account_number,
        pix_key=pix_key,
        document_number=document,
        photo=photo_path,
        active=True,
    )

    db.add(courier)
    db.commit()
    db.refresh(courier)

    return serialize_courier(courier)


@router.get("/{courier_id}")
def get_courier(courier_id: int, db: Session = Depends(get_db)):
    courier = db.get(Courier, courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Entregador não encontrado")
    return serialize_courier(courier)


@router.get("/user/{user_id}")
def get_courier_by_user(user_id: int, db: Session = Depends(get_db)):
    courier = db.query(Courier).filter(Courier.user_id == user_id).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Usuário não possui cadastro de entregador")
    return serialize_courier(courier)

