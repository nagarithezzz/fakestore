from datetime import datetime, timezone

from pymongo import ReturnDocument
from pymongo.database import Database

from app.core.mongo_ids import parse_object_id, str_id
from app.models.billing import Billing, BillingStatus


def _doc_to_billing(doc: dict) -> Billing:
    ga = doc["generated_at"]
    if ga.tzinfo is None:
        ga = ga.replace(tzinfo=timezone.utc)
    return Billing(
        id=str_id(doc["_id"]),
        user_id=str(doc["user_id"]),
        billing_cycle=doc["billing_cycle"],
        total_amount=float(doc["total_amount"]),
        status=BillingStatus(doc["status"]),
        generated_at=ga,
    )


class BillingRepository:
    def __init__(self, db: Database):
        self._col = db["billing"]

    def get_by_id(self, billing_id: str) -> Billing | None:
        try:
            oid = parse_object_id(billing_id)
        except ValueError:
            return None
        doc = self._col.find_one({"_id": oid})
        return _doc_to_billing(doc) if doc else None

    def get_by_user_cycle(self, user_id: str, billing_cycle: str) -> Billing | None:
        doc = self._col.find_one({"user_id": user_id, "billing_cycle": billing_cycle})
        return _doc_to_billing(doc) if doc else None

    def list_by_user(self, user_id: str) -> list[Billing]:
        cursor = self._col.find({"user_id": user_id}).sort("generated_at", -1)
        return [_doc_to_billing(d) for d in cursor]

    def create(self, user_id: str, billing_cycle: str, total_amount: float) -> Billing:
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": user_id,
            "billing_cycle": billing_cycle,
            "total_amount": total_amount,
            "status": BillingStatus.pending.value,
            "generated_at": now,
        }
        result = self._col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _doc_to_billing(doc)

    def update_total(self, billing_id: str, total_amount: float) -> Billing | None:
        try:
            oid = parse_object_id(billing_id)
        except ValueError:
            return None
        doc = self._col.find_one_and_update(
            {"_id": oid},
            {"$set": {"total_amount": total_amount}},
            return_document=ReturnDocument.AFTER,
        )
        return _doc_to_billing(doc) if doc else None

    def update_status(self, billing: Billing, status: BillingStatus) -> Billing:
        oid = parse_object_id(billing.id)
        doc = self._col.find_one_and_update(
            {"_id": oid},
            {"$set": {"status": status.value}},
            return_document=ReturnDocument.AFTER,
        )
        if not doc:
            return billing
        return _doc_to_billing(doc)

    def sum_paid_amount(self) -> float:
        pipeline = [
            {"$match": {"status": BillingStatus.paid.value}},
            {"$group": {"_id": None, "s": {"$sum": "$total_amount"}}},
        ]
        agg = list(self._col.aggregate(pipeline))
        return float(agg[0]["s"]) if agg else 0.0

    def sum_pending_amount(self) -> float:
        pipeline = [
            {"$match": {"status": BillingStatus.pending.value}},
            {"$group": {"_id": None, "s": {"$sum": "$total_amount"}}},
        ]
        agg = list(self._col.aggregate(pipeline))
        return float(agg[0]["s"]) if agg else 0.0

    def count_all(self) -> int:
        return self._col.count_documents({})
