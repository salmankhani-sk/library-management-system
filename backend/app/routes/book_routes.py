# Import necessary modules from FastAPI and SQLAlchemy.
from fastapi import APIRouter, HTTPException, Depends  # For creating routes, raising exceptions, and dependency injection
from sqlalchemy.orm import Session  # For interacting with the database session
from app.database import Book, Transaction, get_db  # Import Book and Transaction models and the DB session dependency
from app.auth_utils import get_current_user  # Import the function that fetches the currently logged-in user
from app.database import User  # Import the User model
from datetime import datetime  # For dealing with timestamps (borrow and return dates)

# Create an instance of APIRouter to group related routes under a common prefix (optional) or to modularize code.
router = APIRouter()

# PATCH endpoint to update the status of a book (borrow or return).
@router.patch("/books/{isbn}/status")  # This route is accessed via PATCH method with ISBN passed as a path parameter
def update_book_status(
    isbn: str,  # ISBN of the book passed in the URL
    status: str,  # New status for the book ('available' or 'borrowed') passed as a query parameter
    current_user: User = Depends(get_current_user),  # Inject the currently logged-in user using dependency injection
    db: Session = Depends(get_db)  # Inject a SQLAlchemy database session using dependency injection
):
    # Query the database to find the book by its ISBN.
    book = db.query(Book).filter(Book.isbn == isbn).first()

    # If no book is found, return a 404 Not Found error.
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Validate that the provided status is either "available" or "borrowed".
    if status not in ["available", "borrowed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    # Case 1: Borrowing the book (status becomes "borrowed" from "available").
    if status == "borrowed" and book.status == "available":
        # Create a new transaction indicating the book was borrowed by the user.
        transaction = Transaction(
            user_id=current_user.id,  # ID of the user borrowing the book
            book_id=book.id,  # ID of the book being borrowed
            borrow_date=datetime.utcnow(),  # Set current UTC time as borrow date
            status="active"  # Mark the transaction as active
        )
        db.add(transaction)  # Add the transaction to the database
        book.status = "borrowed"  # Update the book's status to "borrowed"

    # Case 2: Returning the book (status becomes "available" from "borrowed").
    elif status == "available" and book.status == "borrowed":
        # Find the active transaction for this book (i.e., the currently borrowed instance).
        transaction = db.query(Transaction).filter(
            Transaction.book_id == book.id,  # Match the book ID
            Transaction.status == "active"  # Make sure it's the active transaction
        ).first()

        # If a matching transaction exists, update it to mark the return.
        if transaction:
            transaction.return_date = datetime.utcnow()  # Set current UTC time as return date
            transaction.status = "returned"  # Mark the transaction as returned

        book.status = "available"  # Update the book's status to "available"

    # If the requested status transition doesn't make logical sense (like borrowing an already borrowed book), raise error.
    else:
        raise HTTPException(status_code=400, detail="Invalid status transition")

    # Save all changes to the database.
    db.commit()

    # Refresh the book object to reflect the latest changes from the DB.
    db.refresh(book)

    # Return a success message along with the updated book data.
    return {
        "message": f"Book status updated to {book.status}",
        "book": {
            "title": book.title,
            "isbn": book.isbn,
            "status": book.status,
        }
    }

# GET endpoint to fetch book details and current status using the ISBN.
@router.get("/books/{isbn}")  # This route is accessed via GET method with ISBN as a path parameter
def get_book_status(isbn: str, db: Session = Depends(get_db)):  # ISBN is input, db session is injected
    # Query the database for the book with the given ISBN.
    book = db.query(Book).filter(Book.isbn == isbn).first()

    # If the book doesn't exist, raise a 404 error.
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Return the book details including its current status.
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "status": book.status,
        "thumbnail": book.thumbnail  # Include thumbnail image URL if available
    }
