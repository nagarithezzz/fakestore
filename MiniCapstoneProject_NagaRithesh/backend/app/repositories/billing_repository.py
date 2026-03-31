from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.billing import Billing, BillingStatus


class BillingRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, billing_id: int) -> Billing | None:
        return self._db.get(Billing, billing_id)

    def get_by_user_cycle(self, user_id: int, billing_cycle: str) -> Billing | None:
        stmt = select(Billing).where(
            Billing.user_id == user_id,
            Billing.billing_cycle == billing_cycle,
        )
        return self._db.execute(stmt).scalar_one_or_none()

    def list_by_user(self, user_id: int) -> list[Billing]:
        stmt = select(Billing).where(Billing.user_id == user_id).order_by(Billing.generated_at.desc())
        return list(self._db.execute(stmt).scalars().all())

    def create(self, user_id: int, billing_cycle: str, total_amount: float) -> Billing:
        bill = Billing(
            user_id=user_id,
            billing_cycle=billing_cycle,
            total_amount=total_amount,
            status=BillingStatus.pending,
        )
        self._db.add(bill)
        self._db.commit()
        self._db.refresh(bill)
        return bill

    def update_status(self, billing: Billing, status: BillingStatus) -> Billing:
        billing.status = status
        self._db.commit()
        self._db.refresh(billing)
        return billing

    def sum_paid_amount(self) -> float:
        from sqlalchemy import func

        stmt = select(func.coalesce(func.sum(Billing.total_amount), 0.0)).where(
            Billing.status == BillingStatus.paid
        )
        return float(self._db.execute(stmt).scalar_one())

    def sum_pending_amount(self) -> float:
        from sqlalchemy import func

        stmt = select(func.coalesce(func.sum(Billing.total_amount), 0.0)).where(
            Billing.status == BillingStatus.pending
        )
        return float(self._db.execute(stmt).scalar_one())

    def count_all(self) -> int:
        from sqlalchemy import func

        stmt = select(func.count()).select_from(Billing)
        return int(self._db.execute(stmt).scalar_one())
