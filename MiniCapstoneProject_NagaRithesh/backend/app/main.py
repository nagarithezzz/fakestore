from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.database import ensure_indexes, get_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_indexes(get_database())
    yield


app = FastAPI(
    title="Telecom CDR & Billing API",
    description="Call detail records, billing, plans, and admin analytics",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}
