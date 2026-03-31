from sqlalchemy.orm import Session

from app.schemas.plan_schema import PlanCreate, PlanOut
from app.services.plan_service import PlanService


class PlanController:
    def __init__(self, db: Session):
        self._service = PlanService(db)

    def list_plans(self) -> list[PlanOut]:
        rows = self._service.list_plans()
        return [PlanOut.model_validate(r) for r in rows]

    def create(self, body: PlanCreate) -> PlanOut:
        plan = self._service.create_plan(
            body.name,
            body.call_rate,
            body.sms_rate,
            body.data_rate,
        )
        return PlanOut.model_validate(plan)
