import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import ensure_indexes, get_database
from app.core.security import hash_password
from app.models.user import UserRole
from app.repositories.plan_repository import PlanRepository
from app.repositories.user_repository import UserRepository


def run():
    db = get_database()
    ensure_indexes(db)
    plans = PlanRepository(db)
    p = plans.list_all()
    if not p:
        plans.create("Standard Prepaid", 0.5, 0.1, 0.01)
        p = plans.list_all()
    plan_id = p[0].id
    users = UserRepository(db)
    admin_mobile = "9000000001"
    if not users.get_by_mobile(admin_mobile):
        users.create(
            name="System Admin",
            mobile_number=admin_mobile,
            hashed_password=hash_password("admin123"),
            role=UserRole.admin,
            plan_id=plan_id,
        )


if __name__ == "__main__":
    run()
