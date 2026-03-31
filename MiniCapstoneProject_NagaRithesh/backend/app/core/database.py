from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
    return _client


def get_database() -> Database:
    return get_client()[settings.mongodb_db_name]


def get_db():
    db = get_database()
    yield db


def ensure_indexes(db: Database) -> None:
    db["users"].create_index("mobile_number", unique=True)
    db["billing"].create_index([("user_id", 1), ("billing_cycle", 1)], unique=True)
    db["cdr_records"].create_index([("user_id", 1), ("timestamp", -1)])
