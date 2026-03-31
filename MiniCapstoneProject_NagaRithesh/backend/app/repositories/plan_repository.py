from pymongo.database import Database

from app.core.mongo_ids import parse_object_id, str_id
from app.models.plan import Plan


def _doc_to_plan(doc: dict) -> Plan:
    return Plan(
        id=str_id(doc["_id"]),
        name=doc["name"],
        call_rate=float(doc["call_rate"]),
        sms_rate=float(doc["sms_rate"]),
        data_rate=float(doc["data_rate"]),
    )


class PlanRepository:
    def __init__(self, db: Database):
        self._col = db["plans"]

    def get_by_id(self, plan_id: str) -> Plan | None:
        try:
            oid = parse_object_id(plan_id)
        except ValueError:
            return None
        doc = self._col.find_one({"_id": oid})
        return _doc_to_plan(doc) if doc else None

    def list_all(self) -> list[Plan]:
        docs = self._col.find().sort("_id", 1)
        return [_doc_to_plan(d) for d in docs]

    def create(self, name: str, call_rate: float, sms_rate: float, data_rate: float) -> Plan:
        doc = {
            "name": name,
            "call_rate": call_rate,
            "sms_rate": sms_rate,
            "data_rate": data_rate,
        }
        result = self._col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _doc_to_plan(doc)
