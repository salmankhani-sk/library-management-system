# app/auth_utils.py

# Import Depends, HTTPException, and status from FastAPI for dependency injection, error handling, and HTTP status codes.
# Depends is used to inject dependencies into functions, HTTPException raises HTTP errors, and status provides standard HTTP codes.
from fastapi import Depends, HTTPException, status

# Import OAuth2PasswordBearer from FastAPI's security module to handle OAuth2 token-based authentication.
# This extracts the Bearer token from the Authorization header of incoming requests.
from fastapi.security import OAuth2PasswordBearer

# Import Session from SQLAlchemy ORM to manage database sessions.
# Session is used to query the database within the authentication functions.
from sqlalchemy.orm import Session

# Import get_db and User from the database module.
# get_db provides a database session, and User is the SQLAlchemy model for the users table.
from app.database import get_db, User

# Import decode_access_token from the security module to decode and validate JWT access tokens.
# This function extracts the payload (e.g., username) from a token.
from app.core.security import decode_access_token

# Import TokenData from the schemas module to define the structure of token payload data.
# TokenData is a Pydantic model used for type validation of token contents.
from app.schemas import TokenData

# Create an OAuth2PasswordBearer instance, specifying the token URL where clients obtain tokens.
# The tokenUrl "/auth/token" is the endpoint where users send login credentials to receive a JWT.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Define a dependency function to retrieve the current authenticated user based on the provided JWT token.
# This function is used as a dependency in routes to ensure the user is authenticated.
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Decode the JWT token using the decode_access_token function to extract its payload.
    # The payload typically includes claims like "sub" (subject, usually the username).
    payload = decode_access_token(token)
    
    # Extract the "sub" claim from the payload, which should contain the username.
    # Type hint ensures username is treated as a string.
    username: str = payload.get("sub")
    
    # If the "sub" claim is missing or None, raise a 401 Unauthorized error.
    # This indicates the token is invalid because it lacks the required user identifier.
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    # Query the database to find a user with the username extracted from the token.
    # .filter_by(username=username) is a SQLAlchemy method to filter by the username column.
    # .first() retrieves the first matching user or None if no match is found.
    user = db.query(User).filter_by(username=username).first()
    
    # If no user is found with the given username, raise a 401 Unauthorized error.
    # This indicates the token references a non-existent user.
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    # Return the User object if authentication is successful.
    # This object can be used in route handlers for further processing.
    return user

# Define a dependency function to ensure the current user is active.
# This function builds on get_current_user to add additional checks (e.g., for user status).
def get_current_active_user(current_user = Depends(get_current_user)):
    # Placeholder for checking a 'disabled' flag or other user status.
    # Currently, it does not perform any checks, but you could add logic to verify if the user account is active.
    # For example, you might check `if current_user.disabled: raise HTTPException(...)`.
    # Return the current_user object unchanged, assuming the user is active.
    return current_user

# Define a RoleChecker class to enforce role-based access control (RBAC).
# This class creates a reusable dependency for restricting access to specific roles.
class RoleChecker:
    # Initialize the RoleChecker with a list of allowed roles.
    # allowed_roles is a list of strings (e.g., ["admin", "librarian"]) that defines which roles can access a route.
    def __init__(self, allowed_roles: list[str]):
        # Store the allowed roles in an instance variable for use in the __call__ method.
        self.allowed = allowed_roles

    # Define the __call__ method to make RoleChecker instances callable as FastAPI dependencies.
    # This method checks if the current user's role is in the allowed roles.
    def __call__(self, current_user = Depends(get_current_active_user)):
        # Check if the user's role (accessed via current_user.role) is in the allowed roles.
        # current_user.role is assumed to be a string attribute of the User model.
        if current_user.role not in self.allowed:
            # If the user's role is not allowed, raise a 403 Forbidden error.
            # This indicates the user is authenticated but lacks the necessary permissions.
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        # If the role is allowed, return the current_user object.
        # This allows the route handler to proceed with the authenticated and authorized user.
        return current_user