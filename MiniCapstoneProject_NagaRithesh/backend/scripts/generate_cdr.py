import random
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from pymongo.database import Database

from app.core.database import get_database
from app.models.cdr import CDRType
from app.services.cdr_service import CDRService


@dataclass
class GeneratedCDR:
    user_id: str
    cdr_type: CDRType
    duration: int
    data_used: float
    destination_number: str | None
    timestamp: datetime


def random_mobile(rng: random.Random) -> str:
    return f"9{rng.randint(0, 999999999):09d}"


def random_cdr(user_id: str, rng: random.Random, now: datetime | None = None) -> GeneratedCDR:
    cdr_type = rng.choice([CDRType.call, CDRType.sms, CDRType.data])
    anchor = now or datetime.now(timezone.utc)
    ts = anchor - timedelta(minutes=rng.randint(0, 60 * 24 * 30))

    if cdr_type == CDRType.call:
        return GeneratedCDR(
            user_id=user_id,
            cdr_type=cdr_type,
            duration=rng.randint(1, 3600),
            data_used=0.0,
            destination_number=random_mobile(rng),
            timestamp=ts,
        )
    if cdr_type == CDRType.sms:
        return GeneratedCDR(
            user_id=user_id,
            cdr_type=cdr_type,
            duration=1,
            data_used=0.0,
            destination_number=random_mobile(rng),
            timestamp=ts,
        )
    return GeneratedCDR(
        user_id=user_id,
        cdr_type=cdr_type,
        duration=0,
        data_used=round(rng.uniform(0.1, 2500.0), 2),
        destination_number=None,
        timestamp=ts,
    )


def generate_for_users(
    db: Database,
    records_per_user: int = 25,
    seed: int | None = None,
    now: datetime | None = None,
) -> int:
    rng = random.Random(seed)
    user_ids = [str(doc["_id"]) for doc in db["users"].find({}, {"_id": 1})]
    service = CDRService(db)
    created = 0

    for user_id in user_ids:
        for _ in range(records_per_user):
            cdr = random_cdr(user_id=user_id, rng=rng, now=now)
            service.add_record(
                user_id=cdr.user_id,
                cdr_type=cdr.cdr_type,
                duration=cdr.duration,
                data_used=cdr.data_used,
                destination_number=cdr.destination_number,
                timestamp=cdr.timestamp,
            )
            created += 1
    return created


def run(records_per_user: int = 25, seed: int | None = None) -> int:
    db = get_database()
    return generate_for_users(db=db, records_per_user=records_per_user, seed=seed)


if __name__ == "__main__":
    total = run()
    print(f"Generated {total} CDR records")
