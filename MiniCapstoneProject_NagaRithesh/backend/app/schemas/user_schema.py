from pydantic import BaseModel

from app.models.user import UserRole


class UserOut(BaseModel):
    id: int
    name: str
    mobile_number: str
    role: UserRole
    plan_id: int | None

    model_config = {"from_attributes": True}
