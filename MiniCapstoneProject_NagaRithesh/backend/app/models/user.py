import enum
from dataclasses import dataclass
from datetime import datetime


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"


@dataclass
class User:
    id: str
    name: str
    mobile_number: str
    hashed_password: str
    role: UserRole
    plan_id: str | None
    created_at: datetime | None = None
