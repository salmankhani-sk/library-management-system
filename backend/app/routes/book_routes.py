# app/routes/book_routes.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import Book, Transaction, SessionLocal, get_db
from app.auth_utils import get_current_user
from app.database import User
from datetime import datetime

router = APIRouter()

@router.patch("/books/{isbn}/status")
def update_book_status(
    isbn: str,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.isbn == isbn).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if status not in ["available", "borrowed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    if status == "borrowed" and book.status == "available":
        # Create a new transaction for borrowing
        transaction = Transaction(
            user_id=current_user.id,
            book_id=book.id,
            borrow_date=datetime.utcnow(),
            status="active"
        )
        db.add(transaction)
        book.status = "borrowed"
    elif status == "available" and book.status == "borrowed":
        # Update the existing transaction for returning
        transaction = db.query(Transaction).filter(
            Transaction.book_id == book.id,
            Transaction.status == "active"
        ).first()
        if transaction:
            transaction.return_date = datetime.utcnow()
            transaction.status = "returned"
        book.status = "available"
    else:
        raise HTTPException(status_code=400, detail="Invalid status transition")

    db.commit()
    db.refresh(book)
    return {
        "message": f"Book status updated to {book.status}",
        "book": {
            "title": book.title,
            "isbn": book.isbn,
            "status": book.status,
        }
    }