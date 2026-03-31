import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base, ensure_database_exists
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.plan import Plan
import app.models


def run():
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        p = db.execute(select(Plan).limit(1)).scalar_one_or_none()
        if not p:
            p = Plan(name="Standard Prepaid", call_rate=0.5, sms_rate=0.1, data_rate=0.01)
            db.add(p)
            db.commit()
            db.refresh(p)
        admin_mobile = "9000000001"
        existing = db.execute(select(User).where(User.mobile_number == admin_mobile)).scalar_one_or_none()
        if not existing:
            db.add(
                User(
                    name="System Admin",
                    mobile_number=admin_mobile,
                    hashed_password=hash_password("admin123"),
                    role=UserRole.admin,
                    plan_id=p.id,
                )
            )
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
