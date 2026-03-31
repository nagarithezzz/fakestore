from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.controllers.admin_controller import AdminController
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.schemas.admin_schema import AdminReportsOut
from app.schemas.user_schema import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


def get_controller(db: Database = Depends(get_db)) -> AdminController:
    return AdminController(db)


@router.get("/reports", response_model=AdminReportsOut)
def reports(
    _: User = Depends(require_admin),
    ctrl: AdminController = Depends(get_controller),
):
    return ctrl.reports()


@router.get("/users", response_model=list[UserOut])
def list_users(
    _: User = Depends(require_admin),
    ctrl: AdminController = Depends(get_controller),
):
    return ctrl.users()
