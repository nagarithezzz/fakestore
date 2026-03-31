from bson import ObjectId
from bson.errors import InvalidId


def parse_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as e:
        raise ValueError("Invalid id") from e


def str_id(oid: ObjectId) -> str:
    return str(oid)
