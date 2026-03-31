from datetime import datetime

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import bad_request, not_found
from app.models.cdr import CDRType
from app.repositories.cdr_repository import CDRRepository
from app.repositories.user_repository import UserRepository


class CDRService:
    def __init__(self, db: Session):
        self._db = db
        self._cdr = CDRRepository(db)
        self._users = UserRepository(db)

    def add_record(
        self,
        user_id: int,
        cdr_type: CDRType,
        duration: int,
        data_used: float,
        destination_number: str | None,
        timestamp: datetime | None,
    ):
        user = self._users.get_by_id(user_id)
        if not user:
            raise not_found("User not found")
        if cdr_type == CDRType.call and duration < 0:
            raise bad_request("Invalid duration")
        if cdr_type == CDRType.data and data_used < 0:
            raise bad_request("Invalid data_used")
        return self._cdr.create(
            user_id=user_id,
            cdr_type=cdr_type,
            duration=duration,
            data_used=data_used,
            destination_number=destination_number,
            timestamp=timestamp,
        )

    def list_my(self, user_id: int, skip: int, limit: int):
        return self._cdr.list_by_user(user_id, skip=skip, limit=limit)
