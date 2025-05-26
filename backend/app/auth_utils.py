
# Import Depends and HTTPException from FastAPI for handling dependencies and raising HTTP errors.
# Depends is used to inject dependencies into route functions, while HTTPException is for error handling.
from fastapi import Depends, HTTPException

# Import OAuth2PasswordBearer from FastAPI's security module to handle OAuth2 token-based authentication.
# This will extract the token from the Authorization header in requests.
from fastapi.security import OAuth2PasswordBearer

# Import Session from SQLAlchemy ORM to manage database sessions.
# Session is used to interact with the database in a transactional manner.
from sqlalchemy.orm import Session

# Import jwt and JWTError from the jose library to handle JSON Web Tokens (JWT) for authentication.
# jwt is used for encoding/decoding tokens, and JWTError is raised when token processing fails.
from jose import jwt, JWTError

# Import CryptContext from passlib to handle password hashing and verification.
# CryptContext provides a flexible way to hash and verify passwords using various schemes.
from passlib.context import CryptContext

# Import os to interact with the operating system, specifically for accessing environment variables.
# This is used to securely retrieve sensitive data like the SECRET_KEY.
import os

# Import load_dotenv from python-dotenv to load environment variables from a .env file.
# This allows configuration to be stored outside the codebase, improving security.
from dotenv import load_dotenv

# Import User model and SessionLocal from the database module to interact with the User table.
# User is the SQLAlchemy model for the users table, and SessionLocal is a factory for database sessions.
from .database import User, SessionLocal

# Load environment variables from a .env file, typically located in the project root.
# This ensures that sensitive variables like SECRET_KEY are available to the application.
load_dotenv()

# Retrieve the SECRET_KEY from environment variables, defaulting to "mysecret" if not set.
# SECRET_KEY is used to sign and verify JWTs; in production, it should be a strong, unique value.
SECRET_KEY = os.getenv("SECRET_KEY", "mysecret")  # Use a strong secret in production

# Define the algorithm used for signing JWTs, here set to HS256 (HMAC with SHA-256).
# HS256 is a widely used symmetric signing algorithm combining a secret key with SHA-256 hashing.
ALGORITHM = "HS256"
# Create a CryptContext instance for password hashing, using bcrypt as the hashing scheme.
# 'deprecated="auto"' ensures that deprecated schemes are updated automatically for security.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define a function to hash a plain-text password using the configured CryptContext.
# This function takes a password string as input and returns its hashed version.
def get_password_hash(password: str) -> str:
    # Use the CryptContext to hash the provided password and return the hashed string.
    # The bcrypt scheme generates a secure, salted hash suitable for storing passwords.
    return pwd_context.hash(password)

# Define a function to verify a plain-text password against a hashed password.
# This function checks if a provided password matches a stored hash, returning a boolean.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Use the CryptContext to verify if the plain password matches the hashed password.
    # This securely compares the two without exposing the original password.
    return pwd_context.verify(plain_password, hashed_password)

# Define a function to create a JWT access token from a dictionary of claims.
# This function generates a token that can be used to authenticate a user.
def create_access_token(data: dict) -> str:
    # Encode the data (e.g., user info like username) into a JWT using the SECRET_KEY and ALGORITHM.
    # The resulting token is a string that can be sent to clients for authentication.
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# Create an OAuth2PasswordBearer instance, specifying the token URL where clients can obtain tokens.
# This sets up the OAuth2 scheme to expect a Bearer token in the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Define a dependency function to get the current authenticated user based on the provided token.
# This function is used as a dependency in routes to ensure the user is authenticated.
def get_current_user(token: str = Depends(oauth2_scheme)):
    # Use a try-except block to handle potential errors during token decoding.
    try:
        # Decode the JWT token using the SECRET_KEY and ALGORITHM to extract the payload.
        # The payload contains claims like the username (subject).
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Extract the 'sub' (subject) claim from the payload, which typically holds the username.
        # Type hint ensures username is treated as a string.
        username: str = payload.get("sub")
        # If the 'sub' claim is missing, raise an HTTP 401 error indicating an invalid token.
        # This ensures the token contains necessary user identification.
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    # Catch any JWTError (e.g., invalid signature, expired token) that occurs during decoding.
    except JWTError:
        # Raise an HTTP 401 error if token decoding fails for any reason.
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Create a new database session using SessionLocal to query the User table.
    # This ensures a fresh connection for each request.
    db = SessionLocal()
    # Query the database for a user with the username extracted from the token.
    # .first() retrieves the first matching record or None if no match is found.
    user = db.query(User).filter(User.username == username).first()
    # Close the database session to free up resources and prevent leaks.
    db.close()
    # If no user is found with the given username, raise an HTTP 401 error.
    # This ensures the token corresponds to an actual user in the system.
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    # Return the user object if authentication and authorization are successful.
    # This user object can be used in the route handler.
    return user

# Define a function to create a role-based access control (RBAC) dependency.
# This allows restricting access to routes based on user roles.
def RoleChecker(allowed_roles: list):
    # Define an inner function that checks if the current user's role is in the allowed roles.
    # This inner function will be used as a dependency in route definitions.
    def role_checker(current_user: User = Depends(get_current_user)):
        # Check if the user's role is not in the list of allowed roles.
        # current_user.role is assumed to be a string attribute of the User model.
        if current_user.role not in allowed_roles:
            # Raise an HTTP 403 error if the user's role doesn't match the required roles.
            # This indicates the user is authenticated but lacks permission.
            raise HTTPException(status_code=403, detail="Operation not permitted")
        # If the role is allowed, return the current user object.
        # This allows the route handler to proceed with the authenticated user.
        return current_user
    # Return the inner function, which can be used as a dependency in route definitions.
    # This enables flexible role-based access control for different endpoints.
    return role_checker