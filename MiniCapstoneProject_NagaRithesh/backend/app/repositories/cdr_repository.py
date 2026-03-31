from datetime import datetime, timezone

from pymongo.database import Database

from app.core.mongo_ids import parse_object_id, str_id
from app.models.cdr import CDRRecord, CDRType


def _doc_to_cdr(doc: dict) -> CDRRecord:
    ts = doc["timestamp"]
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return CDRRecord(
        id=str_id(doc["_id"]),
        user_id=str(doc["user_id"]),
        type=CDRType(doc["type"]),
        duration=int(doc["duration"]),
        data_used=float(doc["data_used"]),
        destination_number=doc.get("destination_number"),
        timestamp=ts,
    )


class CDRRepository:
    def __init__(self, db: Database):
        self._col = db["cdr_records"]

    def create(
        self,
        user_id: str,
        cdr_type: CDRType,
        duration: int,
        data_used: float,
        destination_number: str | None,
        timestamp: datetime | None,
    ) -> CDRRecord:
        ts = timestamp if timestamp is not None else datetime.now(timezone.utc)
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        doc = {
            "user_id": user_id,
            "type": cdr_type.value,
            "duration": duration,
            "data_used": data_used,
            "destination_number": destination_number,
            "timestamp": ts,
        }
        result = self._col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _doc_to_cdr(doc)

    def list_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        cdr_type: CDRType | None = None,
        from_ts: datetime | None = None,
        to_ts: datetime | None = None,
    ) -> list[CDRRecord]:
        query: dict = {"user_id": user_id}
        if cdr_type is not None:
            query["type"] = cdr_type.value
        if from_ts is not None or to_ts is not None:
            query["timestamp"] = {}
            if from_ts is not None:
                query["timestamp"]["$gte"] = from_ts
            if to_ts is not None:
                query["timestamp"]["$lte"] = to_ts
        cursor = self._col.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        return [_doc_to_cdr(d) for d in cursor]

    def list_by_user_in_cycle(
        self, user_id: str, start: datetime, end_exclusive: datetime
    ) -> list[CDRRecord]:
        cursor = self._col.find(
            {
                "user_id": user_id,
                "timestamp": {"$gte": start, "$lt": end_exclusive},
            }
        )
        return [_doc_to_cdr(d) for d in cursor]

    def count_all(self) -> int:
        return self._col.count_documents({})
