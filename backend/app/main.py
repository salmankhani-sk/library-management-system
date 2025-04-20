# backend/app/main.py

# Import FastAPI class for creating the web application, Depends for dependency injection, and HTTPException for error handling.
from fastapi import FastAPI, Depends, HTTPException
# Import CORSMiddleware to enable Cross-Origin Resource Sharing, allowing the frontend to communicate with the backend.
from fastapi.middleware.cors import CORSMiddleware
# Import Session class from SQLAlchemy ORM to manage database connections and transactions.
from sqlalchemy.orm import Session
# Import User and Book models (database table representations) and get_db function to provide database sessions.
from app.database import User, Book, get_db
# Import routers from app.routes module to organize and include various endpoint groups (books, book_routes, auth, admin).
from app.routes import books, book_routes, auth as auth_routes, admin
# Import get_password_hash function from auth_utils to securely hash user passwords before storing them.
from app.auth_utils import get_password_hash

# Instantiate the FastAPI application, which serves as the core of the web service.
app = FastAPI()

# Include the books router, adding endpoints related to book management (e.g., listing books).
app.include_router(books.router)
# Include the book_routes router, adding additional book-related endpoints (e.g., borrowing books).
app.include_router(book_routes.router)
# Include the auth_routes router (aliased from auth), adding authentication endpoints (e.g., login/logout).
app.include_router(auth_routes.router)
# Include the admin router, adding admin-specific endpoints (e.g., managing users or system settings).
app.include_router(admin.router)

# Configure CORS middleware to allow cross-origin requests from specified origins.
app.add_middleware(
    CORSMiddleware,  # Use CORSMiddleware class to handle CORS settings.
    allow_origins=["http://localhost:3000"],  # Permit requests only from this origin (e.g., frontend running locally).
    allow_credentials=True,  # Allow cookies and authentication headers to be sent with requests.
    allow_methods=["*"],  # Permit all HTTP methods (GET, POST, etc.).
    allow_headers=["*"],  # Permit all headers in requests.
)

# Define a GET endpoint at the root URL ("/") to serve as a basic health check or welcome message.
@app.get("/")
def read_root():
    # Return a JSON response with a welcome message for the library system.
    return {"message": "Welcome to the Online Library Management System"}

# Define a POST endpoint at "/users/" to create a new user in the system.
@app.post("/users/")
def create_user(username: str, email: str, password: str, db: Session = Depends(get_db)):
    # Query the database to check if a user with the provided username already exists.
    existing_user = db.query(User).filter(User.username == username).first()
    # If a user with the username exists, raise an HTTP 400 error with a descriptive message.
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    # Query the database to check if a user with the provided email already exists.
    existing_email = db.query(User).filter(User.email == email).first()
    # If a user with the email exists, raise an HTTP 400 error with a descriptive message.
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Hash the provided password using the get_password_hash function for secure storage.
    hashed_password = get_password_hash(password)
    # Create a new User object with the provided username, email, and hashed password.
    new_user = User(username=username, email=email, hashed_password=hashed_password)
    # Add the new User object to the current database session.
    db.add(new_user)
    # Commit the session to save the new user to the database.
    db.commit()
    # Refresh the new_user object to retrieve updated attributes (e.g., auto-generated ID).
    db.refresh(new_user)
    # Return a JSON response with the new user's ID, username, and email.
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email}

# Define a GET endpoint at "/users/" to retrieve a list of all users in the system.
@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    # Query the database to fetch all User records.
    users = db.query(User).all()
    # Return a list of dictionaries, each containing a user's ID, username, and email.
    return [{"id": u.id, "username": u.username, "email": u.email} for u in users]

# Define a POST endpoint at "/books/" to create a new book in the system.
@app.post("/books/")
def create_book(
    title: str = "Unknown",  # Book title parameter with a default value if not provided.
    author: str = "Unknown",  # Book author parameter with a default value if not provided.
    isbn: str = "N/A",  # Book ISBN parameter with a default value if not provided.
    db: Session = Depends(get_db)  # Database session dependency to interact with the database.
):
    # Validate that title, author, and ISBN are non-empty and ISBN is not the default "N/A".
    if not title.strip() or not author.strip() or not isbn.strip() or isbn == "N/A":
        # Raise an HTTP 400 error if validation fails, indicating invalid input.
        raise HTTPException(status_code=400, detail="Title, author, and ISBN must be provided and valid.")
    try:
        # Create a new Book object with the provided title, author, and ISBN.
        new_book = Book(title=title, author=author, isbn=isbn)
        # Add the new Book object to the current database session.
        db.add(new_book)
        # Commit the session to save the new book to the database.
        db.commit()
        # Refresh the new_book object to retrieve updated attributes (e.g., auto-generated ID).
        db.refresh(new_book)
        # Return a JSON response with the new book's ID, title, author, ISBN, and status.
        return {
            "id": new_book.id,
            "title": new_book.title,
            "author": new_book.author,
            "isbn": new_book.isbn,
            "status": new_book.status
        }
    except Exception as e:
        # If an error occurs during database operations, roll back the session to undo changes.
        db.rollback()
        # Check if the error is due to a duplicate ISBN (e.g., unique constraint violation).
        if "duplicate key value" in str(e):
            # Raise an HTTP 400 error with a specific message about the duplicate ISBN.
            raise HTTPException(status_code=400, detail=f"Book with ISBN '{isbn}' already exists.")
        # For other errors, raise an HTTP 500 error with a generic failure message and error details.
        raise HTTPException(status_code=500, detail=f"Failed to add book: {str(e)}")

# Define a GET endpoint at "/books/" to retrieve a list of all books in the system.
@app.get("/books/")
def get_books(db: Session = Depends(get_db)):
    # Query the database to fetch all Book records.
    books = db.query(Book).all()
    # Return a list of dictionaries, each containing a book's ID, title, author, ISBN, and status.
    return [{"id": b.id, "title": b.title, "author": b.author, "isbn": b.isbn, "status": b.status} for b in books]