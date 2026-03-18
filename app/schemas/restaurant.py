from pydantic import BaseModel, Field


class RestaurantAddress(BaseModel):
    street: str | None = None
    number: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    cep: str | None = None


class RestaurantCreate(BaseModel):
    user_id: int | None = None
    name: str = Field(min_length=2, max_length=150)
    owner_name: str | None = None
    description: str | None = None
    image: str | None = None
    phone: str | None = None

    address_street: str | None = None
    address_number: str | None = None
    address_neighborhood: str | None = None
    address_city: str | None = None
    address_state: str | None = None
    address_cep: str | None = None

    latitude: float | None = None
    longitude: float | None = None

    delivery_fee: float = 0

    pix_key: str | None = None
    bank_name: str | None = None
    account_type: str | None = None
    agency: str | None = None
    account_number: str | None = None
    document_number: str | None = None


class RestaurantOut(BaseModel):
    id: int
    user_id: int | None
    name: str
    owner_name: str | None = None
    description: str | None = None
    image: str | None = None
    phone: str | None = None

    address: RestaurantAddress | None = None
    latitude: float | None = None
    longitude: float | None = None

    delivery_fee: float

    pix_key: str | None = None
    bank_name: str | None = None
    account_type: str | None = None
    agency: str | None = None
    account_number: str | None = None
    document_number: str | None = None

    stripe_account_id: str | None = None
    stripe_onboarding_complete: bool

    model_config = {"from_attributes": True}