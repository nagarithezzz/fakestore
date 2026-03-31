from sqlalchemy.orm import Session

from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthService


class AuthController:
    def __init__(self, db: Session):
        self._service = AuthService(db)

    def register(self, body: RegisterRequest) -> TokenResponse:
        data = self._service.register(
            body.name,
            body.mobile_number,
            body.password,
            body.plan_id,
        )
        return TokenResponse(**data)

    def login(self, body: LoginRequest) -> TokenResponse:
        data = self._service.login(body.mobile_number, body.password)
        return TokenResponse(**data)
