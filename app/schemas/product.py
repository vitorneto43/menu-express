from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    restaurant_id: int
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    price: float
    image: str | None = None
    available: bool = True


class ProductOut(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str | None
    price: float
    image: str | None
    available: bool

    model_config = {"from_attributes": True}