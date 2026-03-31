from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.controllers.cdr_controller import CDRController
from app.core.database import get_db
from app.core.dependencies import require_admin, require_customer
from app.models.cdr import CDRType
from app.models.user import User
from app.schemas.cdr_schema import CDRCreate, CDROut

router = APIRouter(prefix="/cdr", tags=["cdr"])


def get_controller(db: Database = Depends(get_db)) -> CDRController:
    return CDRController(db)


@router.post("", response_model=CDROut)
def add_cdr(
    body: CDRCreate,
    _: User = Depends(require_admin),
    ctrl: CDRController = Depends(get_controller),
):
    return ctrl.create(body)


@router.get("/my", response_model=list[CDROut])
def my_cdr(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    cdr_type: CDRType | None = Query(None, alias="type", description="Filter by CDR type"),
    from_ts: datetime | None = Query(None, alias="from", description="Start timestamp (ISO 8601)"),
    to_ts: datetime | None = Query(None, alias="to", description="End timestamp (ISO 8601)"),
    user: User = Depends(require_customer),
    ctrl: CDRController = Depends(get_controller),
):
    return ctrl.my_history(user.id, skip, limit, cdr_type, from_ts, to_ts)
