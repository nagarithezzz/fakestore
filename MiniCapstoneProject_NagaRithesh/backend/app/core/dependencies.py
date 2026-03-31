from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.exceptions.custom_exceptions import forbidden, unauthorized
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise unauthorized("Invalid or expired token")
    try:
        uid = int(payload["sub"])
    except (ValueError, TypeError):
        raise unauthorized("Invalid token subject")
    user = UserRepository(db).get_by_id(uid)
    if not user:
        raise unauthorized("User not found")
    return user


def get_current_user(
    user: User | None = Depends(get_current_user_optional),
) -> User:
    if not user:
        raise unauthorized("Not authenticated")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise forbidden("Admin only")
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.customer:
        raise forbidden("Customer only")
    return user
