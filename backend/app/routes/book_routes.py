
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import Book, Transaction, User, get_db
from app.auth_utils import get_current_user
from datetime import datetime
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/books", tags=["Book Actions"])

# Pydantic model for borrow/return payload
class BookAction(BaseModel):
    isbn: str

@router.get("/{isbn}")
def get_book(isbn: str, db: Session = Depends(get_db)):
    """
    Fetch a book by ISBN.
    """
    book = db.query(Book).filter(Book.isbn == isbn).first()
    if not book:
        logger.error(f"Book not found for ISBN: {isbn}")
        raise HTTPException(status_code=404, detail="Book not found")
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "status": book.status,
        "thumbnail": book.thumbnail
    }

@router.get("/{isbn}/transaction")
def get_book_transaction(isbn: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Check if the current user has an active transaction for the book.
    """
    logger.info(f"Checking transaction for ISBN: {isbn}, user: {current_user.id}")
    book = db.query(Book).filter(Book.isbn == isbn).first()
    if not book:
        logger.error(f"Book not found for ISBN: {isbn}")
        raise HTTPException(status_code=404, detail="Book not found")
    transaction = db.query(Transaction).filter(
        Transaction.book_id == book.id,
        Transaction.user_id == current_user.id,
        Transaction.status == "active"
    ).first()
    if not transaction:
        return {"has_active_transaction": False, "transaction_id": None}
    return {
        "has_active_transaction": True,
        "transaction_id": transaction.id,
        "borrow_date": transaction.borrow_date
    }

@router.post("/borrow")
def borrow_book(action: BookAction, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Borrow a book by ISBN, creating a transaction and updating book status.
    """
    logger.info(f"Received borrow request: {action.dict()}")
    isbn = action.isbn
    book = db.query(Book).filter(Book.isbn == isbn).first()
    if not book:
        logger.error(f"Book not found for ISBN: {isbn}")
        raise HTTPException(status_code=404, detail="Book not found")
    if book.status != "available":
        logger.warning(f"Book not available: {isbn}, status: {book.status}")
        raise HTTPException(status_code=400, detail="Book is not available")

    transaction = Transaction(
        user_id=current_user.id,
        book_id=book.id,
        borrow_date=datetime.utcnow(),
        status="active"
    )
    book.status = "borrowed"
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    logger.info(f"Book borrowed successfully: {isbn}, transaction_id: {transaction.id}")
    return {"message": "Book borrowed successfully", "transaction_id": transaction.id}

@router.post("/return")
def return_book(action: BookAction, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Return a borrowed book by ISBN, updating transaction and book status.
    """
    logger.info(f"Received return request: {action.dict()}")
    isbn = action.isbn
    book = db.query(Book).filter(Book.isbn == isbn).first()
    if not book:
        logger.error(f"Book not found for ISBN: {isbn}")
        raise HTTPException(status_code=404, detail="Book not found")
    transaction = db.query(Transaction).filter(
        Transaction.book_id == book.id,
        Transaction.user_id == current_user.id,
        Transaction.status == "active"
    ).first()
    if not transaction:
        logger.warning(f"No active transaction for ISBN: {isbn}, user: {current_user.id}")
        raise HTTPException(status_code=400, detail="No active borrowing record found")

    transaction.return_date = datetime.utcnow()
    transaction.status = "returned"
    book.status = "available"
    db.commit()
    logger.info(f"Book returned successfully: {isbn}")
    return {"message": "Book returned successfully"}