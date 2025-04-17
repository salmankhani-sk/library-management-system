from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db, User
from app.core.security import decode_access_token
from app.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")
    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user

def get_current_active_user(current_user = Depends(get_current_user)):
    # you could check a 'disabled' flag here
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed = allowed_roles

    def __call__(self, current_user = Depends(get_current_active_user)):
        if current_user.role not in self.allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return current_user
