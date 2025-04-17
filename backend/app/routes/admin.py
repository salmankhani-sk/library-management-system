# app/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db, User, Transaction
from app.auth_utils import get_password_hash, RoleChecker
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
import io

router = APIRouter(prefix="/admin", tags=["admin"])

admin_only = RoleChecker(["admin"])

@router.get("/users/", dependencies=[Depends(admin_only)])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]

@router.post("/users/", dependencies=[Depends(admin_only)])
def create_user(username: str, email: str, password: str, role: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed_password = get_password_hash(password)
    new_user = User(username=username, email=email, hashed_password=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email, "role": new_user.role}

@router.get("/transactions/", dependencies=[Depends(admin_only)])
def get_all_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).options(
        joinedload(Transaction.user), joinedload(Transaction.book)
    ).all()
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

@router.get("/transactions/report", dependencies=[Depends(admin_only)])
def get_transactions_report(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).options(
        joinedload(Transaction.user), joinedload(Transaction.book)
    ).all()
    
    # Prepare data for the PDF table
    data = [["ID", "User", "Book", "Borrow Date", "Return Date", "Status"]]
    for t in transactions:
        data.append([
            t.id,
            t.user.username,
            t.book.title,
            t.borrow_date.strftime("%Y-%m-%d"),
            t.return_date.strftime("%Y-%m-%d") if t.return_date else "N/A",
            t.status
        ])
    
    # Generate the PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    table = Table(data)
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ])
    table.setStyle(style)
    doc.build([table])
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=transactions_report.pdf"}
    )