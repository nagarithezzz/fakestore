from pymongo.database import Database

from app.repositories.plan_repository import PlanRepository


class PlanService:
    def __init__(self, db: Database):
        self._db = db
        self._plans = PlanRepository(db)

    def list_plans(self):
        return self._plans.list_all()

    def create_plan(self, name: str, call_rate: float, sms_rate: float, data_rate: float):
        return self._plans.create(name, call_rate, sms_rate, data_rate)
