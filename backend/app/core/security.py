# app/core/security.py

# Import CryptContext from passlib to handle password hashing and verification.
# CryptContext provides a flexible interface for hashing passwords using various schemes.
from passlib.context import CryptContext

# Import JWTError and jwt from the jose library to handle JSON Web Tokens (JWT) for authentication.
# jwt is used for encoding and decoding tokens, and JWTError is raised when token processing fails.
from jose import JWTError, jwt

# Import datetime and timedelta from the datetime module to manage token expiration times.
# datetime is used for current time, and timedelta calculates expiration durations.
from datetime import datetime, timedelta

# Import HTTPException and status from FastAPI to raise HTTP errors with specific status codes.
# HTTPException is used to return error responses, and status provides standard HTTP status codes.
from fastapi import HTTPException, status

# Create a CryptContext instance configured to use the bcrypt hashing scheme.
# 'schemes=["bcrypt"]' specifies bcrypt as the hashing algorithm, and 'deprecated="auto"' ensures outdated schemes are updated.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define the SECRET_KEY used for signing and verifying JWTs.
# This is a placeholder indicating that you should generate a secure key (e.g., using `openssl rand -hex 32` in a terminal).
# In production, this should be a strong, unique, and securely stored value, typically in an environment variable.
SECRET_KEY = "…generate‑with‑openssl rand‑hex 32…"

# Define the algorithm used for signing JWTs, set to HS256 (HMAC with SHA-256).
# HS256 is a symmetric signing algorithm that combines the SECRET_KEY with SHA-256 hashing for security.
ALGORITHM = "HS256"

# Define the default expiration time for access tokens in minutes (60 minutes = 1 hour).
# This determines how long a JWT remains valid before requiring re-authentication.
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Define a function to verify a plain-text password against a hashed password.
# This function checks if the provided password matches the stored hash, returning a boolean.
def verify_password(plain: str, hashed: str) -> bool:
    # Use the CryptContext to verify if the plain-text password matches the hashed password.
    # This performs a secure comparison, returning True if they match, False otherwise.
    return pwd_context.verify(plain, hashed)

# Define a function to hash a plain-text password for secure storage.
# This function takes a password string and returns its hashed version.
def get_password_hash(password: str) -> str:
    # Use the CryptContext to hash the provided password using bcrypt.
    # The resulting hash includes a salt and is suitable for secure storage in a database.
    return pwd_context.hash(password)

# Define a function to create a JWT access token from a dictionary of claims.
# This function generates a token with an optional expiration time for authentication.
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    # Create a copy of the input data dictionary to avoid modifying the original.
    # This ensures the function doesn't have unintended side effects on the input.
    to_encode = data.copy()
    # Calculate the expiration time for the token.
    # If expires_delta is provided, use it; otherwise, use the default ACCESS_TOKEN_EXPIRE_MINUTES.
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    # Add the expiration time ("exp") to the data to be encoded in the token.
    # The "exp" claim is a standard JWT claim that specifies when the token expires.
    to_encode.update({"exp": expire})
    # Encode the data (including expiration) into a JWT using the SECRET_KEY and ALGORITHM.
    # The resulting string is the JWT that can be sent to clients for authentication.
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Define a function to decode a JWT access token and return its payload.
# This function validates the token and extracts the claims (e.g., username, expiration).
def decode_access_token(token: str) -> dict:
    # Use a try-except block to handle potential errors during token decoding.
    try:
        # Decode the JWT using the SECRET_KEY and ALGORITHM to extract the payload.
        # The payload is a dictionary containing claims like "sub" (subject) and "exp" (expiration).
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    # Catch any JWTError (e.g., invalid signature, expired token, malformed token).
    except JWTError:
        # Raise an HTTP 401 error if token decoding fails for any reason.
        # The error includes a descriptive message and a WWW-Authenticate header for OAuth2 compliance.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )