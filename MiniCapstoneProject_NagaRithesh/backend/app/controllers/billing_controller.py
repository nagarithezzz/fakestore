from pymongo.database import Database

from app.models.billing import BillingStatus
from app.schemas.billing_schema import BillingGenerateRequest, BillingOut
from app.services.billing_service import BillingService


class BillingController:
    def __init__(self, db: Database):
        self._service = BillingService(db)

    def generate(self, body: BillingGenerateRequest) -> BillingOut:
        bill = self._service.generate_bill(body.user_id, body.billing_cycle)
        return BillingOut.model_validate(bill)

    def my_bills(
        self,
        user_id: str,
        status: BillingStatus | None = None,
        billing_cycle: str | None = None,
    ) -> list[BillingOut]:
        rows = self._service.list_my(user_id, status=status, billing_cycle=billing_cycle)
        return [BillingOut.model_validate(r) for r in rows]

    def pay(self, billing_id: str, user_id: str) -> BillingOut:
        bill = self._service.pay_bill(billing_id, user_id)
        return BillingOut.model_validate(bill)
