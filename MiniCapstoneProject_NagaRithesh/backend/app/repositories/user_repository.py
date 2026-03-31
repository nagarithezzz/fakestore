from datetime import datetime, timezone

from bson import ObjectId
from pymongo.database import Database

from app.core.mongo_ids import parse_object_id, str_id
from app.models.user import User, UserRole


def _doc_to_user(doc: dict) -> User:
    return User(
        id=str_id(doc["_id"]),
        name=doc["name"],
        mobile_number=doc["mobile_number"],
        hashed_password=doc["hashed_password"],
        role=UserRole(doc["role"]),
        plan_id=str(doc["plan_id"]) if doc.get("plan_id") else None,
        created_at=doc.get("created_at"),
    )


class UserRepository:
    def __init__(self, db: Database):
        self._col = db["users"]

    def get_by_id(self, user_id: str) -> User | None:
        try:
            oid = parse_object_id(user_id)
        except ValueError:
            return None
        doc = self._col.find_one({"_id": oid})
        return _doc_to_user(doc) if doc else None

    def get_by_mobile(self, mobile_number: str) -> User | None:
        doc = self._col.find_one({"mobile_number": mobile_number})
        return _doc_to_user(doc) if doc else None

    def list_all(
        self,
        role: UserRole | None = None,
        mobile_contains: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        query: dict = {}
        if role is not None:
            query["role"] = role.value
        if mobile_contains:
            query["mobile_number"] = {"$regex": mobile_contains}
        docs = self._col.find(query).sort("_id", 1).skip(skip).limit(limit)
        return [_doc_to_user(d) for d in docs]

    def count(self) -> int:
        return self._col.count_documents({})

    def create(
        self,
        name: str,
        mobile_number: str,
        hashed_password: str,
        role: UserRole,
        plan_id: str | None,
    ) -> User:
        now = datetime.now(timezone.utc)
        doc: dict = {
            "name": name,
            "mobile_number": mobile_number,
            "hashed_password": hashed_password,
            "role": role.value,
            "created_at": now,
        }
        if plan_id is not None:
            doc["plan_id"] = parse_object_id(plan_id)
        else:
            doc["plan_id"] = None
        result = self._col.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _doc_to_user(doc)
