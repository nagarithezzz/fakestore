from datetime import datetime

from pydantic import BaseModel, Field

from app.models.cdr import CDRType


class CDRCreate(BaseModel):
    user_id: str
    type: CDRType
    duration: int = Field(default=0, ge=0)
    data_used: float = Field(default=0.0, ge=0)
    destination_number: str | None = None
    timestamp: datetime | None = None


class CDROut(BaseModel):
    id: str
    user_id: str
    type: CDRType
    duration: int
    data_used: float
    destination_number: str | None
    timestamp: datetime

    model_config = {"from_attributes": True}
