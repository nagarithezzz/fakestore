from pydantic import BaseModel, Field


class PlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    call_rate: float = Field(..., ge=0)
    sms_rate: float = Field(..., ge=0)
    data_rate: float = Field(..., ge=0)


class PlanOut(BaseModel):
    id: int
    name: str
    call_rate: float
    sms_rate: float
    data_rate: float

    model_config = {"from_attributes": True}
