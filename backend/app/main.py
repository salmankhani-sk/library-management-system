# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import User, Book, get_db
from app.routes import books, book_routes, auth as auth_routes, admin
from app.auth_utils import get_password_hash

app = FastAPI()
app.include_router(books.router)
app.include_router(book_routes.router)
app.include_router(auth_routes.router)
app.include_router(admin.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Online Library Management System"}

@app.post("/users/")
def create_user(username: str, email: str, password: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(password)
    new_user = User(username=username, email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email}

@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email} for u in users]

@app.post("/books/")
def create_book(
    title: str = "Unknown",
    author: str = "Unknown",
    isbn: str = "N/A",
    db: Session = Depends(get_db)
):
    if not title.strip() or not author.strip() or not isbn.strip() or isbn == "N/A":
        raise HTTPException(status_code=400, detail="Title, author, and ISBN must be provided and valid.")
    try:
        new_book = Book(title=title, author=author, isbn=isbn)
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        return {
            "id": new_book.id,
            "title": new_book.title,
            "author": new_book.author,
            "isbn": new_book.isbn,
            "status": new_book.status
        }
    except Exception as e:
        db.rollback()
        if "duplicate key value" in str(e):
            raise HTTPException(status_code=400, detail=f"Book with ISBN '{isbn}' already exists.")
        raise HTTPException(status_code=500, detail=f"Failed to add book: {str(e)}")

@app.get("/books/")
def get_books(db: Session = Depends(get_db)):
    books = db.query(Book).all()
    return [{"id": b.id, "title": b.title, "author": b.author, "isbn": b.isbn, "status": b.status} for b in books]