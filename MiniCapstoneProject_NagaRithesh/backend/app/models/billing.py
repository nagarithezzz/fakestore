import enum
from dataclasses import dataclass
from datetime import datetime


class BillingStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"


@dataclass
class Billing:
    id: str
    user_id: str
    billing_cycle: str
    total_amount: float
    status: BillingStatus
    generated_at: datetime
