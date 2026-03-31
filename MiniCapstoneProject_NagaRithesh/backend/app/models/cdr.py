import enum
from dataclasses import dataclass
from datetime import datetime


class CDRType(str, enum.Enum):
    call = "call"
    sms = "sms"
    data = "data"


@dataclass
class CDRRecord:
    id: str
    user_id: str
    type: CDRType
    duration: int
    data_used: float
    destination_number: str | None
    timestamp: datetime
