from pydantic import BaseModel


class DeliveryAddress(BaseModel):
    street: str
    number: str
    neighborhood: str
    city: str
    state: str
    cep: str
    complement: str | None = None
    reference: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    user_id: int
    restaurant_id: int
    subtotal: float
    delivery_fee: float = 0
    total: float
    payment_method: str = "card"
    partner_delivery: bool = False
    courier_id: int | None = None
    items: list[OrderItemCreate]
    delivery_address: DeliveryAddress


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    subtotal: float
    delivery_fee: float
    total: float
    payment_method: str
    partner_delivery: bool
    courier_id: int | None = None
    status: str
    items: list[OrderItemOut]
    delivery_address: DeliveryAddress

    model_config = {"from_attributes": True}