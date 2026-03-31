from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    call_rate: Mapped[float] = mapped_column(Float)
    sms_rate: Mapped[float] = mapped_column(Float)
    data_rate: Mapped[float] = mapped_column(Float)

    users = relationship("User", back_populates="plan")
