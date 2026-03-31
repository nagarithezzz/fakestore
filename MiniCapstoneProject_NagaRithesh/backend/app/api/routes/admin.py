from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.controllers.admin_controller import AdminController
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User, UserRole
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
    role: UserRole | None = Query(None, description="Filter users by role"),
    mobile_contains: str | None = Query(
        None, description="Filter users whose mobile contains this value"
    ),
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max users to return"),
    _: User = Depends(require_admin),
    ctrl: AdminController = Depends(get_controller),
):
    return ctrl.users(role=role, mobile_contains=mobile_contains, skip=skip, limit=limit)
