# Import BaseModel from Pydantic, which is the base class for creating data models with validation.
# This allows us to define structured data models with type hints and automatic validation.
from pydantic import BaseModel, EmailStr

# Import Literal from the typing module to define string literal types (e.g., for roles).
# Literal restricts a variable to specific string values, improving type safety.
from typing import Literal


# Define the UserLogin class, inheriting from BaseModel, to represent the data structure for user login requests.
# This model ensures that login data conforms to the specified structure and types.
class UserLogin(BaseModel):
    # The username field is a string, required for identifying the user during login.
    # Pydantic will validate that this is a non-empty string when an instance is created.
    username: str
    # The password field is a string, required for authentication during login.
    # No additional validation (e.g., length) is applied here.
    password: str

# Define the UserCreate class, inheriting from BaseModel, to represent the data structure for creating a new user.
# This model is used when registering a new user, ensuring all required fields are provided.
class UserCreate(BaseModel):
    # The username field is a string, required for the new user's unique identifier.
    # This will typically be checked for uniqueness in the database elsewhere in the application.
    username: str
    # The email field uses EmailStr, a Pydantic type that validates the input as a valid email address.
    # For example, "user@example.com" is valid, but "invalid-email" would raise a validation error.
    email: EmailStr
    # The password field is a string, required for setting the user's password.
    # In a real application, this would likely be hashed before storage, but this model only defines the input.
    password: str

# Define the UserRead class, inheriting from BaseModel, to represent the data structure for reading user information.
# This model is typically used to return user data after retrieval from a database.
class UserRead(BaseModel):
    # The id field is an integer, typically the user's unique identifier in the database.
    # This is included in UserRead (but not UserCreate) since the ID is assigned by the system.
    id: int
    # The username field is a string, representing the user's unique username.
    # This mirrors the username provided during creation, included here for display or reference.
    username: str
    # The email field uses EmailStr, ensuring it's a valid email address when retrieved.
    # This matches the email provided during user creation.
    email: EmailStr
    # The role field uses Literal to restrict values to "user", "librarian", or "admin".
    # This defines the user's permissions in the system, enforced at the type level.
    role: Literal["user", "librarian", "admin"]

# Define the Token class, inheriting from BaseModel, to represent the structure of the authentication token returned after login.
# This model is used to structure the response sent to the client after successful authentication.
class Token(BaseModel):
    # The access_token field is a string, containing the JWT  token used for authentication.
    # This token is typically sent in the Authorization header of subsequent requests.
    access_token: str
    # The token_type field is a string with a default value of "bearer", indicating the type of token.
    # "Bearer" is a common standard for JWTs, and the default simplifies client usage.
    token_type: str = "bearer"

# Define the TokenData class, inheriting from BaseModel, to represent the data extracted from the authentication token.
# This model is used internally to decode and validate token contents, such as during request authentication.
class TokenData(BaseModel):
    # The username field is an optional string, representing the username extracted from the token (if present).
    # The | None syntax (union type) means it can be a string or None, with None as the default if not provided.
    username: str | None = None
    # The role field is an optional string, representing the user's role extracted from the token (if present).
    # Like username, it defaults to None if the token doesn't include this information.
    role: str | None = None