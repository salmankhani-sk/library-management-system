from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.database import Book
from app.schemas import BookResponse

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/", response_model=List[BookResponse])
def get_all_books(db: Session = Depends(get_db)):
    """
    Fetch all books from the database.
    Returns a list of books with isbn, title, author, and status.
    """
    try:
        books = db.query(Book).all()
        if not books:
            raise HTTPException(status_code=404, detail="No books found")
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching books: {str(e)}")