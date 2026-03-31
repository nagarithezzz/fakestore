from pymongo.database import Database

from app.models.user import UserRole
from app.repositories.billing_repository import BillingRepository
from app.repositories.cdr_repository import CDRRepository
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: Database):
        self._db = db
        self._users = UserRepository(db)
        self._cdr = CDRRepository(db)
        self._billing = BillingRepository(db)

    def reports(self) -> dict:
        return {
            "total_users": self._users.count(),
            "total_cdr_records": self._cdr.count_all(),
            "total_revenue_paid": self._billing.sum_paid_amount(),
            "total_revenue_pending": self._billing.sum_pending_amount(),
            "total_bills": self._billing.count_all(),
        }

    def list_users(
        self,
        role: UserRole | None = None,
        mobile_contains: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ):
        return self._users.list_all(
            role=role, mobile_contains=mobile_contains, skip=skip, limit=limit
        )
