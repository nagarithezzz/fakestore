from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers.auth_controller import AuthController
from app.core.database import get_db
from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def get_controller(db: Session = Depends(get_db)) -> AuthController:
    return AuthController(db)


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, ctrl: AuthController = Depends(get_controller)):
    return ctrl.register(body)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, ctrl: AuthController = Depends(get_controller)):
    return ctrl.login(body)
