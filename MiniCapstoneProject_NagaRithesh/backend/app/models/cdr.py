import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CDRType(str, enum.Enum):
    call = "call"
    sms = "sms"
    data = "data"


class CDRRecord(Base):
    __tablename__ = "cdr_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[CDRType] = mapped_column(Enum(CDRType))
    duration: Mapped[int] = mapped_column(Integer, default=0)
    data_used: Mapped[float] = mapped_column(Float, default=0.0)
    destination_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="cdr_records")
