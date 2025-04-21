# Import APIRouter, HTTPException, and status from FastAPI to create a router for authentication routes.
# APIRouter organizes routes, HTTPException handles errors, and status provides HTTP status codes.
from fastapi import APIRouter, HTTPException, status, Depends

# Import Session from SQLAlchemy ORM to manage database sessions.
# Session is used to interact with the database within route functions.
from sqlalchemy.orm import Session

# Import BaseModel and EmailStr from Pydantic to define data models with validation.
# BaseModel is the base class for Pydantic models, and EmailStr validates email addresses.
from pydantic import BaseModel, EmailStr

# Import User model and get_db function from the database module.
# User is the SQLAlchemy model for the users table, and get_db provides a database session.
from app.database import User, get_db

# Import authentication utility functions from auth_utils.
# get_password_hash hashes passwords, verify_password checks passwords, create_access_token generates JWTs.
from app.auth_utils import get_password_hash, verify_password, create_access_token

# Redundant import of get_db; this line is unnecessary since get_db is already imported above.
# Including it again does not affect functionality but is not best practice.
from app.database import get_db

# Create an APIRouter instance with a prefix of "/auth" and a tag of "auth".
# The prefix prepends "/auth" to all routes in this router (e.g., "/auth/signup").
# The tag groups these routes under "auth" in the FastAPI documentation (e.g., Swagger UI).
router = APIRouter(prefix="/auth", tags=["auth"])

# Define a Pydantic model for the signup request body.
# This model validates the data sent by the client when creating a new user.
class SignupData(BaseModel):
    # The username field is a string, required for the new user's unique identifier.
    # Pydantic ensures it's a non-empty string.
    username: str
    # The email field uses EmailStr to validate that the input is a valid email address.
    # For example, "user@example.com" is valid, but "invalid" would raise a validation error.
    email: EmailStr
    # The password field is a string, required for setting the user's password.
    # This will be hashed before storage, but the model only defines the input format.
    password: str
    # The role field is a string with a default value of "user".
    # This defines the user's role (e.g., "user", "admin") if not specified in the request.
    role: str = "user"  # default role is "user"

# Define a Pydantic model for the login request body.
# This model validates the data sent by the client when logging in.
class LoginData(BaseModel):
    # The username field is a string, required to identify the user during login.
    # Pydantic ensures it's a non-empty string.
    username: str
    # The password field is a string, required for authentication.
    # This will be verified against the stored hashed password.
    password: str

# Define a POST route at "/auth/signup" to handle user registration.
# This endpoint creates a new user in the database.
@router.post("/signup")
def signup(data: SignupData, db: Session = Depends(get_db)):
    # Query the database to check if a user with the provided username or email already exists.
    # The query uses OR (|) to match either condition, and .first() retrieves the first match or None.
    existing_user = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    # If a user is found, raise a 400 error to indicate that the username or email is already taken.
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with that username or email already exists."
        )
    # Hash the provided password using the get_password_hash function for secure storage.
    hashed_password = get_password_hash(data.password)
    # Create a new User object with the provided username, email, hashed password, and role.
    # The User model is a SQLAlchemy model that maps to the users table in the database.
    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password,
        role=data.role
    )
    # Add the new User object to the database session, marking it for insertion.
    db.add(new_user)
    # Commit the session to save the new user to the database.
    db.commit()
    # Refresh the new_user object to retrieve updated attributes (e.g., auto-generated ID).
    db.refresh(new_user)
    # Return a JSON response confirming successful user creation.
    # Include the new user's ID, username, email, and role in the response.
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role
        }
    }

# Define a POST route at "/auth/login" to handle user login.
# This endpoint authenticates a user and returns a JWT access token.
@router.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    # Query the database to find a user with the provided username.
    # .first() retrieves the first matching user or None if not found.
    user = db.query(User).filter(User.username == data.username).first()
    # Check if the user exists and if the provided password matches the stored hashed password.
    # If either check fails, raise a 401 error for invalid credentials.
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    # Create a JWT access token with the user's username as the subject ("sub").
    # The token is generated using the create_access_token function from auth_utils.
    access_token = create_access_token({"sub": user.username})
    # Return a JSON response containing the access token, token type, and user details.
    # The token can be used in subsequent requests for authentication.
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