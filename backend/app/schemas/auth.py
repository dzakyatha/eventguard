# skrip untuk skema autentikasi

from pydantic import BaseModel

# skema untuk request login
class LoginRequest(BaseModel):
    username: str
    password: str

# skema untuk response token
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    user_id: int