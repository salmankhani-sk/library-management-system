# app/routes/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import User, get_db
from app.auth_utils import get_password_hash, verify_password, create_access_token
from app.database import  get_db
router = APIRouter(prefix="/auth", tags=["auth"])

# Pydantic models for request bodies
class SignupData(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"  # default role is "user"

class LoginData(BaseModel):
    username: str
    password: str

@router.post("/signup")
def signup(data: SignupData, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with that username or email already exists."
        )
    hashed_password = get_password_hash(data.password)
    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@router.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    access_token = create_access_token({"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }
    