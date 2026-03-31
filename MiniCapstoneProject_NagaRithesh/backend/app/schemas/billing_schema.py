from datetime import datetime

from pydantic import BaseModel, Field

from app.models.billing import BillingStatus


class BillingGenerateRequest(BaseModel):
    user_id: int
    billing_cycle: str = Field(..., pattern=r"^\d{4}-\d{2}$")


class BillingOut(BaseModel):
    id: int
    user_id: int
    billing_cycle: str
    total_amount: float
    status: BillingStatus
    generated_at: datetime

    model_config = {"from_attributes": True}
