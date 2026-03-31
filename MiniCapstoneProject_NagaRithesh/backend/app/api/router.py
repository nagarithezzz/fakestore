from fastapi import APIRouter

from app.api.routes import admin, auth, billing, cdr, plans

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(cdr.router)
api_router.include_router(billing.router)
api_router.include_router(plans.router)
api_router.include_router(admin.router)
