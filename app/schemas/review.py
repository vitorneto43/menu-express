# app/schemas/review.py

from pydantic import BaseModel


class ReviewCreate(BaseModel):
    order_id: int
    restaurant_id: int | None = None
    courier_id: int | None = None
    user_id: int
    rating: int
    comment: str | None = None