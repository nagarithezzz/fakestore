import re

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def ensure_database_exists() -> None:
    url = make_url(settings.database_url)
    if not url.database:
        return
    dbname = url.database
    if not re.fullmatch(r"[A-Za-z0-9_]+", dbname):
        raise ValueError("database name in DATABASE_URL must be alphanumeric or underscore")
    admin_url = url.set(database="postgres")
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT", pool_pre_ping=True)
    with admin_engine.connect() as conn:
        row = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": dbname},
        ).scalar_one_or_none()
        if row is None:
            conn.execute(text(f'CREATE DATABASE "{dbname}"'))


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
