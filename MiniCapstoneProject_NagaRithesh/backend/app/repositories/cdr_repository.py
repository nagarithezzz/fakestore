from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cdr import CDRRecord, CDRType


class CDRRepository:
    def __init__(self, db: Session):
        self._db = db

    def create(
        self,
        user_id: int,
        cdr_type: CDRType,
        duration: int,
        data_used: float,
        destination_number: str | None,
        timestamp: datetime | None,
    ) -> CDRRecord:
        record = CDRRecord(
            user_id=user_id,
            type=cdr_type,
            duration=duration,
            data_used=data_used,
            destination_number=destination_number,
        )
        if timestamp is not None:
            record.timestamp = timestamp
        self._db.add(record)
        self._db.commit()
        self._db.refresh(record)
        return record

    def list_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[CDRRecord]:
        stmt = (
            select(CDRRecord)
            .where(CDRRecord.user_id == user_id)
            .order_by(CDRRecord.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self._db.execute(stmt).scalars().all())

    def list_by_user_in_cycle(self, user_id: int, start: datetime, end_exclusive: datetime) -> list[CDRRecord]:
        stmt = select(CDRRecord).where(
            CDRRecord.user_id == user_id,
            CDRRecord.timestamp >= start,
            CDRRecord.timestamp < end_exclusive,
        )
        return list(self._db.execute(stmt).scalars().all())

    def count_all(self) -> int:
        from sqlalchemy import func

        stmt = select(func.count()).select_from(CDRRecord)
        return int(self._db.execute(stmt).scalar_one())
