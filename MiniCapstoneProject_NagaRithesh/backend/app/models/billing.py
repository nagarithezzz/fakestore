import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BillingStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"


class Billing(Base):
    __tablename__ = "billing"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    billing_cycle: Mapped[str] = mapped_column(String(20))
    total_amount: Mapped[float] = mapped_column(Float)
    status: Mapped[BillingStatus] = mapped_column(Enum(BillingStatus), default=BillingStatus.pending)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="billings")
