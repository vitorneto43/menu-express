from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from sqlalchemy import Float

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"), nullable=False)

    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    payment_method: Mapped[str] = mapped_column(String(30), nullable=False, default="card")

    partner_delivery: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    courier_id: Mapped[int | None] = mapped_column(ForeignKey("couriers.id"), nullable=True)
    driver_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    driver_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    delivery_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    delivery_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    platform_order_commission: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    courier_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    platform_delivery_commission: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    restaurant_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_charge_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    transfer_group: Mapped[str | None] = mapped_column(String(255), nullable=True)
    transfer_status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)

    status: Mapped[str] = mapped_column(
        Enum(
            "pending",
            "accepted",
            "preparing",
            "ready",
            "picked_up",
            "on_the_way",
            "delivered",
            "cancelled",
            name="order_status",
        ),
        default="pending",
        nullable=False,
    )

    delivery_street: Mapped[str] = mapped_column(String(255), nullable=False)
    delivery_number: Mapped[str] = mapped_column(String(50), nullable=False)
    delivery_neighborhood: Mapped[str] = mapped_column(String(120), nullable=False)
    delivery_city: Mapped[str] = mapped_column(String(120), nullable=False)
    delivery_state: Mapped[str] = mapped_column(String(10), nullable=False)
    delivery_cep: Mapped[str] = mapped_column(String(20), nullable=False)
    delivery_complement: Mapped[str | None] = mapped_column(String(255), nullable=True)
    delivery_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)


    estimated_preparation_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, default=25)
    estimated_delivery_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, default=20)
    estimated_total_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, default=45)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("User", back_populates="orders")
    restaurant = relationship("Restaurant", back_populates="orders")
    courier = relationship("Courier", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")