from sqlalchemy.orm import Session

from app.schemas.billing_schema import BillingGenerateRequest, BillingOut
from app.services.billing_service import BillingService


class BillingController:
    def __init__(self, db: Session):
        self._service = BillingService(db)

    def generate(self, body: BillingGenerateRequest) -> BillingOut:
        bill = self._service.generate_bill(body.user_id, body.billing_cycle)
        return BillingOut.model_validate(bill)

    def my_bills(self, user_id: int) -> list[BillingOut]:
        rows = self._service.list_my(user_id)
        return [BillingOut.model_validate(r) for r in rows]

    def pay(self, billing_id: int, user_id: int) -> BillingOut:
        bill = self._service.pay_bill(billing_id, user_id)
        return BillingOut.model_validate(bill)
