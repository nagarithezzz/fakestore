from sqlalchemy.orm import Session

from app.schemas.cdr_schema import CDRCreate, CDROut
from app.services.cdr_service import CDRService


class CDRController:
    def __init__(self, db: Session):
        self._service = CDRService(db)

    def create(self, body: CDRCreate) -> CDROut:
        rec = self._service.add_record(
            body.user_id,
            body.type,
            body.duration,
            body.data_used,
            body.destination_number,
            body.timestamp,
        )
        return CDROut.model_validate(rec)

    def my_history(self, user_id: int, skip: int, limit: int) -> list[CDROut]:
        rows = self._service.list_my(user_id, skip, limit)
        return [CDROut.model_validate(r) for r in rows]
