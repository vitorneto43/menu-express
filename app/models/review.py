# app/models/review.py

from sqlalchemy import Column, Integer, Text, ForeignKey
from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    restaurant_id = Column(Integer, nullable=True)
    courier_id = Column(Integer, nullable=True)
    user_id = Column(Integer)
    rating = Column(Integer)
    comment = Column(Text)