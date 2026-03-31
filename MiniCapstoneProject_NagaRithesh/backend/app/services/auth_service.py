from pymongo.database import Database

from app.exceptions.custom_exceptions import bad_request, unauthorized
from app.models.user import UserRole
from app.repositories.plan_repository import PlanRepository
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, db: Database):
        self._db = db
        self._users = UserRepository(db)

    def register(self, name: str, mobile_number: str, password: str, plan_id: str | None) -> dict:
        if self._users.get_by_mobile(mobile_number):
            raise bad_request("Mobile number already registered")
        if plan_id is not None:
            if not PlanRepository(self._db).get_by_id(plan_id):
                raise bad_request("Invalid plan_id")
        user = self._users.create(
            name=name,
            mobile_number=mobile_number,
            hashed_password=hash_password(password),
            role=UserRole.customer,
            plan_id=plan_id,
        )
        token = create_access_token(
            user.id,
            extra={"role": user.role.value},
        )
        return {"access_token": token, "token_type": "bearer"}

    def login(self, mobile_number: str, password: str) -> dict:
        user = self._users.get_by_mobile(mobile_number)
        if not user or not verify_password(password, user.hashed_password):
            raise unauthorized("Invalid credentials")
        token = create_access_token(
            user.id,
            extra={"role": user.role.value},
        )
        return {"access_token": token, "token_type": "bearer"}
