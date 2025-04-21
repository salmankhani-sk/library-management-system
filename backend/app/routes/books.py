
# Import APIRouter and Depends from FastAPI to create a router and handle dependency injection.
from fastapi import APIRouter, Depends

# Import Session from SQLAlchemy ORM to manage database sessions.
from sqlalchemy.orm import Session

# Import requests library to make HTTP requests to the Google Books API.
import requests

# Import logging to debug database operations.
import logging

# Configure logging to output to the console for debugging.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import get_db and Book from the database module.
from app.database import get_db, Book

# Instantiate an APIRouter object for book-related routes.
router = APIRouter()

# Define a GET endpoint at "/books/search/" to search for books.
@router.get("/books/search/")
def search_books(query: str, db: Session = Depends(get_db)):
    # Set the Google Books API endpoint.
    google_api = "https://www.googleapis.com/books/v1/volumes"
    
    # Make a GET request to the Google Books API with maxResults=40.
    response = requests.get(google_api, params={"q": query, "maxResults": 40})
    
    # Log and handle API request failures.
    if not response.ok:
        logger.error(f"Google Books API request failed: {response.status_code} - {response.text}")
        return []
    
    # Parse the JSON response.
    data = response.json()
    logger.info(f"Google Books API raw response: {data}")

    # Initialize a list for processed book data and a set for tracking ISBNs.
    books = []
    processed_isbns = set()
    
    # Process each book item from the API response.
    for item in data.get("items", []):
        info = item.get("volumeInfo", {})
        image_links = info.get("imageLinks", {})
        industry_ids = info.get("industryIdentifiers", [])
        
        # Prefer ISBN-13, fall back to ISBN-10, or use "Unknown".
        isbn = next(
            (id['identifier'] for id in industry_ids if id['type'] == 'ISBN_13'),
            next((id['identifier'] for id in industry_ids if id['type'] == 'ISBN_10'), "Unknown")
        )
        
        logger.info(f"Processing book with ISBN: {isbn}")

        # Skip books with ISBN=Unknown to avoid duplicates.
        if isbn == "Unknown":
            logger.info(f"Skipping book with ISBN=Unknown, Title={info.get('title', 'Unknown')}")
            continue

        # Skip if ISBN has already been processed.
        if isbn in processed_isbns:
            logger.info(f"Skipping duplicate ISBN: {isbn}")
            continue

        # Check if the book exists in the database.
        existing_book = db.query(Book).filter(Book.isbn == isbn).first()
        
        # If the book doesn't exist, add it to the database.
        if not existing_book:
            try:
                new_book = Book(
                    title=info.get("title", "Unknown"),
                    author=", ".join(info.get("authors", ["Unknown"])),
                    isbn=isbn,
                    status="available",
                    thumbnail=image_links.get("thumbnail")
                )
                db.add(new_book)
                db.commit()
                db.refresh(new_book)
                logger.info(f"Added book to database: {new_book.title} (ISBN: {new_book.isbn})")
                book = new_book
            except Exception as e:
                logger.error(f"Failed to add book with ISBN {isbn}: {str(e)}")
                continue
        else:
            book = existing_book
            logger.info(f"Found existing book: {book.title} (ISBN: {book.isbn})")

        # Add ISBN to processed set.
        processed_isbns.add(isbn)

        # Log the book being appended to the response.
        logger.info(f"Appending book to response: ID={book.id}, ISBN={book.isbn}, Title={book.title}")
        # Append book data from the database to the response.
        books.append({
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "isbn": book.isbn,
            "status": book.status,
            "thumbnail": book.thumbnail
        })

    logger.info(f"Returning {len(books)} books for query: {query}")
    return books