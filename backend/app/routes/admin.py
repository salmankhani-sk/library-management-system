# app/routes/admin.py

# Import APIRouter, Depends, and HTTPException from FastAPI to create a router, handle dependencies, and manage errors.
# APIRouter organizes admin-related routes, Depends injects dependencies, and HTTPException raises HTTP errors.
from fastapi import APIRouter, Depends, HTTPException

# Import Session and joinedload from SQLAlchemy ORM for database operations.
# Session manages database sessions, and joinedload optimizes queries by eagerly loading related data.
from sqlalchemy.orm import Session, joinedload

# Import get_db, User, and Transaction from the database module.
# get_db provides a database session, User and Transaction are models for the users and transactions tables.
from app.database import get_db, User, Transaction

# Import get_password_hash and RoleChecker from auth_utils for password hashing and role-based access control.
# get_password_hash secures passwords, and RoleChecker restricts access to specific roles.
from app.auth_utils import get_password_hash, RoleChecker

# Import StreamingResponse from FastAPI to return streaming data (e.g., PDF files).
# StreamingResponse is used to send the PDF report as a response.
from fastapi.responses import StreamingResponse

# Import letter from reportlab.lib.pagesizes to define the PDF page size (standard letter size).
# This is used to configure the PDF document's dimensions.
from reportlab.lib.pagesizes import letter

# Import SimpleDocTemplate, Table, and TableStyle from reportlab.platypus to create a PDF document with tables.
# SimpleDocTemplate builds the PDF, Table creates tabular data, and TableStyle customizes the table's appearance.
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

# Import colors from reportlab.lib to style the PDF table with colors (e.g., grey, beige).
# Colors are used to enhance the visual presentation of the report.
from reportlab.lib import colors

# Import io to create in-memory byte streams for generating the PDF without writing to disk.
# io.BytesIO is used to hold the PDF data temporarily before streaming it to the client.
import io

# Create an APIRouter instance with a prefix of "/admin" and a tag of "admin".
# The prefix prepends "/admin" to all routes (e.g., "/admin/users/"), and the tag groups routes in documentation.
router = APIRouter(prefix="/admin", tags=["admin"])

# Create a RoleChecker instance that restricts access to routes to users with the "admin" role.
# This dependency ensures that only admin users can access the routes defined in this file.
admin_only = RoleChecker(["admin"])

# Define a GET route at "/admin/users/" to retrieve all users, accessible only to admins.
# The route uses the admin_only dependency to enforce role-based access control.
@router.get("/users/", dependencies=[Depends(admin_only)])
def get_all_users(db: Session = Depends(get_db)):
    # Query the database to fetch all User records.
    # .all() retrieves all users from the users table as a list of User objects.
    users = db.query(User).all()
    # Return a list of dictionaries, each containing a user's ID, username, email, and role.
    # This formats the data for the client, excluding sensitive fields like hashed_password.
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]

# Define a POST route at "/admin/users/" to create a new user, accessible only to admins.
# This route allows admins to manually create users with specific roles.
@router.post("/users/", dependencies=[Depends(admin_only)])
def create_user(username: str, email: str, password: str, role: str, db: Session = Depends(get_db)):
    # Query the database to check if a user with the provided username already exists.
    # .first() retrieves the first matching user or None if not found.
    existing_user = db.query(User).filter(User.username == username).first()
    # If a user with the username exists, raise a 400 error to prevent duplicates.
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    # Query the database to check if a user with the provided email already exists.
    # .first() retrieves the first matching user or None if not found.
    existing_email = db.query(User).filter(User.email == email).first()
    # If a user with the email exists, raise a 400 error to prevent duplicates.
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    # Hash the provided password using get_password_hash for secure storage.
    # This ensures the password is not stored in plain text in the database.
    hashed_password = get_password_hash(password)
    # Create a new User object with the provided username, email, hashed password, and role.
    # The User model maps to the users table in the database.
    new_user = User(username=username, email=email, hashed_password=hashed_password, role=role)
    # Add the new User object to the database session, marking it for insertion.
    db.add(new_user)
    # Commit the session to save the new user to the database.
    db.commit()
    # Refresh the new_user object to retrieve updated attributes (e.g., auto-generated ID).
    db.refresh(new_user)
    # Return a JSON response with the new user's ID, username, email, and role.
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email, "role": new_user.role}

# Define a GET route at "/admin/transactions/" to retrieve all transactions, accessible only to admins.
# This route provides a detailed view of all borrowing and returning activities.
@router.get("/transactions/", dependencies=[Depends(admin_only)])
def get_all_transactions(db: Session = Depends(get_db)):
    # Query the database for all Transaction records, using joinedload to eagerly load related user and book data.
    # joinedload optimizes the query by fetching User and Book data in a single query, reducing database calls.
    transactions = db.query(Transaction).options(
        joinedload(Transaction.user), joinedload(Transaction.book)
    ).all()
    # Return a list of dictionaries, each representing a transaction with user and book details.
    # Format dates as ISO strings and handle nullable return_date gracefully.
    return [
        {
            "id": t.id,
            "user": {"id": t.user.id, "username": t.user.username},
            "book": {"id": t.book.id, "title": t.book.title},
            "borrow_date": t.borrow_date.isoformat(),
            "return_date": t.return_date.isoformat() if t.return_date else None,
            "status": t.status
        }
        for t in transactions
    ]

# Define a GET route at "/admin/transactions/report" to generate a PDF report of all transactions, accessible only to admins.
# This route streams a PDF file containing transaction details.
@router.get("/transactions/report", dependencies=[Depends(admin_only)])
def get_transactions_report(db: Session = Depends(get_db)):
    # Query the database for all Transaction records, using joinedload to fetch related user and book data.
    # This ensures efficient retrieval of user and book information in a single query.
    transactions = db.query(Transaction).options(
        joinedload(Transaction.user), joinedload(Transaction.book)
    ).all()
    
    # Initialize a list to hold table data for the PDF, starting with the header row.
    # The header defines the columns: ID, User, Book, Borrow Date, Return Date, and Status.
    data = [["ID", "User", "Book", "Borrow Date", "Return Date", "Status"]]
    # Iterate over each transaction to populate the table data.
    for t in transactions:
        # Append a row for each transaction, formatting the data appropriately.
        # Dates are converted to strings, and return_date is set to "N/A" if None.
        data.append([
            t.id,
            t.user.username,
            t.book.title,
            t.borrow_date.strftime("%Y-%m-%d"),
            t.return_date.strftime("%Y-%m-%d") if t.return_date else "N/A",
            t.status
        ])
    
    # Create an in-memory byte stream to store the PDF data temporarily.
    # This avoids writing the PDF to disk, making the process more efficient.
    buffer = io.BytesIO()
    # Create a SimpleDocTemplate for the PDF, specifying the buffer and letter page size.
    # SimpleDocTemplate is a ReportLab class for building basic PDF documents.
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    # Create a Table object from the data list, representing the transaction data in tabular form.
    table = Table(data)
    # Define a TableStyle to customize the appearance of the table.
    # This includes background colors, text alignment, font styles, padding, and grid lines.
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Grey background for header row.
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),  # White text for header row.
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # Center-align all cells.
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Bold font for header row.
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),  # Extra padding below header row.
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),  # Beige background for data rows.
        ('GRID', (0, 0), (-1, -1), 1, colors.black)  # Black grid lines for all cells.
    ])
    # Apply the defined style to the table for consistent formatting.
    table.setStyle(style)
    # Build the PDF document, including the table as its only element.
    # This generates the PDF content and writes it to the buffer.
    doc.build([table])
    # Reset the buffer's position to the beginning for reading.
    # This ensures the PDF data can be streamed correctly from the start.
    buffer.seek(0)
    
    # Return a StreamingResponse to send the PDF to the client.
    # The response specifies the media type as PDF and sets a header for file download.
    return StreamingResponse(
        buffer,  # Stream the PDF data from the in-memory buffer.
        media_type="application/pdf",  # Indicate that the response is a PDF file.
        headers={"Content-Disposition": "attachment; filename=transactions_report.pdf"}  # Prompt download with a filename.
    )