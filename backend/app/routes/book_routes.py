# app/routes/book_routes.py

# Import APIRouter from FastAPI to create a router for handling book-related routes.
# APIRouter allows organizing routes into modular components for better structure.
from fastapi import APIRouter, HTTPException, Depends

# Import Session from SQLAlchemy ORM to manage database sessions.
# Session is used to interact with the database within the route functions.
from sqlalchemy.orm import Session

# Import Book, Transaction, SessionLocal, and get_db from the database module.
# Book and Transaction are models representing database tables.
# get_db is a dependency function to provide a database session.
from app.database import Book, Transaction, SessionLocal, get_db

# Import get_current_user from auth_utils to retrieve the authenticated user.
# This dependency ensures that only authenticated users can access the route.
from app.auth_utils import get_current_user

# Import User model from the database module.
# User is the model representing the users table, used for type hinting.
from app.database import User

# Import datetime from the datetime module to handle date and time operations.
# datetime is used to set borrow and return dates in transactions.
from datetime import datetime

# Create an instance of APIRouter to define routes related to book operations.
router = APIRouter()

# Define a PATCH route at "/books/{isbn}/status" to update the status of a book.
# This route allows changing the status of a book (e.g., from "available" to "borrowed").
@router.patch("/books/{isbn}/status")
def update_book_status(
    isbn: str,  # Path parameter: The ISBN of the book to update.
    status: str,  # Query parameter: The new status to set for the book.
    current_user: User = Depends(get_current_user),  # Dependency: Get the authenticated user.
    db: Session = Depends(get_db)  # Dependency: Get a database session.
):
    # Query the database to find the book with the provided ISBN.
    # Use .first() to retrieve the first matching book or None if not found.
    book = db.query(Book).filter(Book.isbn == isbn).first()
    
    # If no book is found with the given ISBN, raise a 404 error.
    # This informs the client that the requested book does not exist.
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Validate that the provided status is either "available" or "borrowed".
    # If the status is invalid, raise a 400 error with a descriptive message.
    if status not in ["available", "borrowed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    # Handle the logic for updating the book status based on the current and new status.
    if status == "borrowed" and book.status == "available":
        # If the book is being borrowed and is currently available:
        # Create a new Transaction object to record the borrowing event.
        transaction = Transaction(
            user_id=current_user.id,  # Set the user ID to the current authenticated user.
            book_id=book.id,  # Set the book ID to the book being borrowed.
            borrow_date=datetime.utcnow(),  # Set the borrow date to the current UTC time.
            status="active"  # Set the transaction status to "active".
        )
        # Add the new transaction to the database session.
        db.add(transaction)
        # Update the book's status to "borrowed".
        book.status = "borrowed"
    
    elif status == "available" and book.status == "borrowed":
        # If the book is being returned and is currently borrowed:
        # Query the database for the active transaction associated with the book.
        transaction = db.query(Transaction).filter(
            Transaction.book_id == book.id,  # Match the book ID.
            Transaction.status == "active"  # Ensure the transaction is still active.
        ).first()
        # If an active transaction is found, update it to reflect the return.
        if transaction:
            transaction.return_date = datetime.utcnow()  # Set the return date to now.
            transaction.status = "returned"  # Change the transaction status to "returned".
        # Update the book's status to "available".
        book.status = "available"
    
    else:
        # If the status transition is invalid (e.g., trying to borrow a borrowed book),
        # raise a 400 error with a message indicating the invalid transition.
        raise HTTPException(status_code=400, detail="Invalid status transition")

    # Commit the changes to the database to persist the updates.
    # This saves both the book status change and any transaction modifications.
    db.commit()
    
    # Refresh the book object to ensure it reflects the latest data from the database.
    # This is useful if there are any database triggers or defaults that might have altered the data.
    db.refresh(book)
    
    # Return a JSON response to the client confirming the status update.
    # The response includes a message and the updated book's details (title, ISBN, status).
    return {
        "message": f"Book status updated to {book.status}",
        "book": {
            "title": book.title,
            "isbn": book.isbn,
            "status": book.status,
        }
    }