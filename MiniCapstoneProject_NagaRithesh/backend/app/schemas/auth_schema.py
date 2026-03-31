from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=1)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    mobile_number: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)
    plan_id: str | None = None
