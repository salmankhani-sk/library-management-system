
# Import create_engine from SQLAlchemy to create a database engine, which manages the connection to the database.
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey

# Import declarative_base from SQLAlchemy to create a base class for defining database models (tables).
from sqlalchemy.ext.declarative import declarative_base

# Import sessionmaker and Session from SQLAlchemy ORM to create and manage database sessions for transactions.
# Import relationship to define relationships between models (e.g., between User and Transaction).
from sqlalchemy.orm import sessionmaker, Session, relationship

# Import datetime from the datetime module to work with date and time values, such as borrow and return dates.
from datetime import datetime

# Import load_dotenv from python-dotenv to load environment variables from a .env file for secure configuration.
from dotenv import load_dotenv

# Import os to interact with the operating system, such as retrieving environment variables.
import os


# Load environment variables from a .env file, typically located in the project root, into the application's environment.
load_dotenv()

# Retrieve the DATABASE_URL environment variable, which contains the connection string for the database (e.g., PostgreSQL, SQLite).
DATABASE_URL = os.getenv("DATABASE_URL")

# Create a SQLAlchemy engine instance using the DATABASE_URL, enabling the application to connect to and interact with the database.
engine = create_engine(DATABASE_URL)

# Create a session factory (SessionLocal) bound to the engine for managing database sessions.
# autocommit=False ensures that changes are not automatically committed; they must be explicitly committed.
# autoflush=False prevents automatic flushing of pending changes before queries, giving more control over transactions.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class (Base) for all database models to inherit from, enabling declarative model definitions.
Base = declarative_base()

# Define the User class, representing the 'users' table in the database, inheriting from Base.
class User(Base):
    # Set the table name in the database to "users".
    __tablename__ = "users"
    
    # Define the 'id' column as an Integer, set as the primary key, and indexed for faster queries.
    id = Column(Integer, primary_key=True, index=True)
    
    # Define the 'username' column as a String, unique to ensure no duplicate usernames, and indexed for quick lookups.
    username = Column(String, unique=True, index=True)
    
    # Define the 'email' column as a String, unique to prevent duplicate email addresses.
    email = Column(String, unique=True)
    
    # Define the 'hashed_password' column as a String to store the user's password in a hashed format for security.
    hashed_password = Column(String)
    
    # Define the 'role' column as a String with a default value of "user", indexed for efficient role-based queries.
    role = Column(String, default="user", index=True)
    
    # Establish a one-to-many relationship with the Transaction model, linking users to their transactions.
    # 'back_populates' connects this relationship to the 'user' field in the Transaction model.
    transactions = relationship("Transaction", back_populates="user")

# Define the Book class, representing the 'books' table in the database, inheriting from Base.
class Book(Base):
    # Set the table name in the database to "books".
    __tablename__ = "books"
    
    # Define the 'id' column as an Integer, set as the primary key, and indexed for faster retrieval.
    id = Column(Integer, primary_key=True, index=True)
    
    # Define the 'title' column as a String, indexed to optimize searches by book title.
    title = Column(String, index=True)
    
    # Define the 'author' column as a String to store the book's author name.
    author = Column(String)
    
    # Define the 'isbn' column as a String, unique to ensure each book has a distinct ISBN identifier.
    isbn = Column(String, unique=True)
    
    # Define the 'status' column as a String with a default value of "available", indicating if the book is available or borrowed.
    status = Column(String, default="available")
    thumbnail = Column(String, nullable=True)
    # Establish a one-to-many relationship with the Transaction model, linking books to their transaction records.
    # 'back_populates' connects this relationship to the 'book' field in the Transaction model.
    transactions = relationship("Transaction", back_populates="book")
    

# Define the Transaction class, representing the 'transactions' table in the database, inheriting from Base.
class Transaction(Base):
    # Set the table name in the database to "transactions".
    __tablename__ = "transactions"
    
    # Define the 'id' column as an Integer, set as the primary key, and indexed for efficient access.
    id = Column(Integer, primary_key=True, index=True)
    
    # Define the 'user_id' column as an Integer, a foreign key referencing the 'id' column in the 'users' table.
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Define the 'book_id' column as an Integer, a foreign key referencing the 'id' column in the 'books' table.
    book_id = Column(Integer, ForeignKey("books.id"))
    
    # Define the 'borrow_date' column as a DateTime, defaulting to the current UTC time when a transaction is created.
    borrow_date = Column(DateTime, default=datetime.utcnow)
    
    # Define the 'return_date' column as a DateTime, nullable to allow null values if the book hasn't been returned yet.
    return_date = Column(DateTime, nullable=True)
    
    # Define the 'status' column as a String with a default value of "active", indicating the transaction state (e.g., active, returned).
    status = Column(String, default="active")
    
    # Establish a many-to-one relationship with the User model, linking each transaction to a specific user.
    # 'back_populates' connects this relationship to the 'transactions' field in the User model.
    user = relationship("User", back_populates="transactions")
    
    # Establish a many-to-one relationship with the Book model, linking each transaction to a specific book.
    # 'back_populates' connects this relationship to the 'transactions' field in the Book model.
    book = relationship("Book", back_populates="transactions")

# Create all tables (User, Book, Transaction) defined in the models within the database.
# This line ensures the database schema matches the model definitions, creating tables if they don’t exist.
Base.metadata.create_all(bind=engine)

# Define a generator function 'get_db' to provide a database session for dependency injection (e.g., in FastAPI).
def get_db():
    # Create a new database session instance using the SessionLocal factory for each request.
    db = SessionLocal()
    try:
        # Yield the session to the caller (e.g., a FastAPI endpoint), allowing it to perform database operations.
        yield db
    finally:
        # Close the session after the request is complete to free up resources and prevent leaks.
        db.close()