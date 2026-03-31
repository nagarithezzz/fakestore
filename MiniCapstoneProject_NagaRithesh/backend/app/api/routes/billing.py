from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.controllers.billing_controller import BillingController
from app.core.database import get_db
from app.core.dependencies import require_admin, require_customer
from app.models.billing import BillingStatus
from app.models.user import User
from app.schemas.billing_schema import BillingGenerateRequest, BillingOut

router = APIRouter(prefix="/billing", tags=["billing"])


def get_controller(db: Database = Depends(get_db)) -> BillingController:
    return BillingController(db)


@router.post("/generate", response_model=BillingOut)
def generate_bill(
    body: BillingGenerateRequest,
    _: User = Depends(require_admin),
    ctrl: BillingController = Depends(get_controller),
):
    return ctrl.generate(body)


@router.get("/my", response_model=list[BillingOut])
def my_bills(
    status: BillingStatus | None = Query(None, description="Filter by bill status"),
    billing_cycle: str | None = Query(
        None,
        pattern=r"^\d{4}-\d{2}$",
        description="Filter by billing cycle (YYYY-MM)",
    ),
    user: User = Depends(require_customer),
    ctrl: BillingController = Depends(get_controller),
):
    return ctrl.my_bills(user.id, status=status, billing_cycle=billing_cycle)


@router.put("/pay/{billing_id}", response_model=BillingOut)
def pay_bill(
    billing_id: str,
    user: User = Depends(require_customer),
    ctrl: BillingController = Depends(get_controller),
):
    return ctrl.pay(billing_id, user.id)
