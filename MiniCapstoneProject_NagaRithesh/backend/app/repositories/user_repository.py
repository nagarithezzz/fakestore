from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self._db.get(User, user_id)

    def get_by_mobile(self, mobile_number: str) -> User | None:
        stmt = select(User).where(User.mobile_number == mobile_number)
        return self._db.execute(stmt).scalar_one_or_none()

    def list_all(self) -> list[User]:
        stmt = select(User).order_by(User.id)
        return list(self._db.execute(stmt).scalars().all())

    def count(self) -> int:
        from sqlalchemy import func

        stmt = select(func.count()).select_from(User)
        return int(self._db.execute(stmt).scalar_one())

    def create(
        self,
        name: str,
        mobile_number: str,
        hashed_password: str,
        role: UserRole,
        plan_id: int | None,
    ) -> User:
        user = User(
            name=name,
            mobile_number=mobile_number,
            hashed_password=hashed_password,
            role=role,
            plan_id=plan_id,
        )
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)
        return user
