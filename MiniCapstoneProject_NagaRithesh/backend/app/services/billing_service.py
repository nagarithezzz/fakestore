from datetime import datetime, timezone

from pymongo.database import Database

from app.exceptions.custom_exceptions import bad_request, forbidden, not_found
from app.models.billing import BillingStatus
from app.models.cdr import CDRType
from app.repositories.billing_repository import BillingRepository
from app.repositories.cdr_repository import CDRRepository
from app.repositories.plan_repository import PlanRepository
from app.repositories.user_repository import UserRepository


class BillingService:
    def __init__(self, db: Database):
        self._db = db
        self._billing = BillingRepository(db)
        self._cdr = CDRRepository(db)
        self._users = UserRepository(db)
        self._plans = PlanRepository(db)

    def _cycle_bounds(self, billing_cycle: str) -> tuple[datetime, datetime]:
        year_s, month_s = billing_cycle.split("-")
        year, month = int(year_s), int(month_s)
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end_exclusive = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end_exclusive = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        return start, end_exclusive

    def _compute_total(self, records, plan) -> float:
        total = 0.0
        for rec in records:
            if rec.type == CDRType.call:
                total += rec.duration * plan.call_rate
            elif rec.type == CDRType.sms:
                total += max(rec.duration, 1) * plan.sms_rate
            elif rec.type == CDRType.data:
                total += rec.data_used * plan.data_rate
        return round(total, 2)

    def generate_bill(self, user_id: str, billing_cycle: str):
        user = self._users.get_by_id(user_id)
        if not user:
            raise not_found("User not found")
        if not user.plan_id:
            raise bad_request("User has no plan assigned")
        plan = self._plans.get_by_id(user.plan_id)
        if not plan:
            raise bad_request("Plan not found")
        start, end_exclusive = self._cycle_bounds(billing_cycle)
        records = self._cdr.list_by_user_in_cycle(user_id, start, end_exclusive)
        total = self._compute_total(records, plan)
        existing = self._billing.get_by_user_cycle(user_id, billing_cycle)
        if existing:
            updated = self._billing.update_total(existing.id, total)
            return updated if updated is not None else existing
        return self._billing.create(user_id, billing_cycle, total)

    def list_my(self, user_id: str):
        return self._billing.list_by_user(user_id)

    def pay_bill(self, billing_id: str, user_id: str):
        bill = self._billing.get_by_id(billing_id)
        if not bill:
            raise not_found("Bill not found")
        if bill.user_id != user_id:
            raise forbidden("Not your bill")
        if bill.status == BillingStatus.paid:
            raise bad_request("Bill already paid")
        return self._billing.update_status(bill, BillingStatus.paid)
