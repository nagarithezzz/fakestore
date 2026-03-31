from sqlalchemy.orm import Session

from app.repositories.billing_repository import BillingRepository
from app.repositories.cdr_repository import CDRRepository
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: Session):
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

    def list_users(self):
        return self._users.list_all()
