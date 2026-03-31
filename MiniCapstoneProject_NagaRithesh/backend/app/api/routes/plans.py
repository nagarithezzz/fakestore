from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers.plan_controller import PlanController
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.schemas.plan_schema import PlanCreate, PlanOut

router = APIRouter(prefix="/plans", tags=["plans"])


def get_controller(db: Session = Depends(get_db)) -> PlanController:
    return PlanController(db)


@router.get("", response_model=list[PlanOut])
def list_plans(ctrl: PlanController = Depends(get_controller)):
    return ctrl.list_plans()


@router.post("", response_model=PlanOut)
def create_plan(
    body: PlanCreate,
    _: User = Depends(require_admin),
    ctrl: PlanController = Depends(get_controller),
):
    return ctrl.create(body)
