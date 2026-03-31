from pymongo.database import Database

from app.models.user import UserRole
from app.schemas.admin_schema import AdminReportsOut
from app.schemas.user_schema import UserOut
from app.services.admin_service import AdminService


class AdminController:
    def __init__(self, db: Database):
        self._service = AdminService(db)

    def reports(self) -> AdminReportsOut:
        data = self._service.reports()
        return AdminReportsOut(**data)

    def users(
        self,
        role: UserRole | None = None,
        mobile_contains: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[UserOut]:
        rows = self._service.list_users(
            role=role, mobile_contains=mobile_contains, skip=skip, limit=limit
        )
        return [UserOut.model_validate(r) for r in rows]
