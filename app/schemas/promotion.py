from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PromotionBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    promotional_price: Optional[float] = None
    banner_url: Optional[str] = None
    active: Optional[bool] = True


class PromotionCreate(PromotionBase):
    restaurant_id: int
    product_id: Optional[int] = None


class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    promotional_price: Optional[float] = None
    banner_url: Optional[str] = None
    active: Optional[bool] = None
    product_id: Optional[int] = None


class PromotionResponse(PromotionBase):
    id: int
    restaurant_id: int
    product_id: Optional[int] = None
    created_at: Optional[datetime]

    # 🔥 adiciona isso
    restaurant_name: Optional[str] = None
    product_name: Optional[str] = None

    class Config:
        from_attributes = True