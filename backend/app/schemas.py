from pydantic import BaseModel, EmailStr
from typing import Literal

from pydantic import BaseModel

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: Literal["user","librarian","admin"]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str | None = None
    role: str | None = None
