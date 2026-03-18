from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class Courier(Base):
    __tablename__ = "couriers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True)

    name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    vehicle_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    bank_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    account_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    agency: Mapped[str | None] = mapped_column(String(50), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pix_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(30), nullable=True)

    photo: Mapped[str | None] = mapped_column(String(255), nullable=True)

    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    stripe_account_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="courier_profile")
    orders = relationship("Order", back_populates="courier")
