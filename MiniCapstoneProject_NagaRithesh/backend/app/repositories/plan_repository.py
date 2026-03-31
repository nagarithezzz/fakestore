from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.plan import Plan


class PlanRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, plan_id: int) -> Plan | None:
        return self._db.get(Plan, plan_id)

    def list_all(self) -> list[Plan]:
        stmt = select(Plan).order_by(Plan.id)
        return list(self._db.execute(stmt).scalars().all())

    def create(self, name: str, call_rate: float, sms_rate: float, data_rate: float) -> Plan:
        plan = Plan(name=name, call_rate=call_rate, sms_rate=sms_rate, data_rate=data_rate)
        self._db.add(plan)
        self._db.commit()
        self._db.refresh(plan)
        return plan
