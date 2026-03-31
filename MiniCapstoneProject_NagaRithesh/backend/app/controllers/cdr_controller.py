from datetime import datetime

from pymongo.database import Database

from app.models.cdr import CDRType
from app.schemas.cdr_schema import CDRCreate, CDROut
from app.services.cdr_service import CDRService


class CDRController:
    def __init__(self, db: Database):
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

    def my_history(
        self,
        user_id: str,
        skip: int,
        limit: int,
        cdr_type: CDRType | None = None,
        from_ts: datetime | None = None,
        to_ts: datetime | None = None,
    ) -> list[CDROut]:
        rows = self._service.list_my(user_id, skip, limit, cdr_type, from_ts, to_ts)
        return [CDROut.model_validate(r) for r in rows]
