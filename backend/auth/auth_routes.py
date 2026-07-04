from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.user import User
from backend.utils.password_utils import verify_password
from backend.auth.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):

    # 1. FIND USER
    user = db.query(User).filter(User.email == email).first()

    # 🔍 DEBUG: email check
    print("LOGIN EMAIL:", email)

    if not user:
        print("USER NOT FOUND")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 🔍 DEBUG: password check
    print("INPUT PASSWORD:", password)
    print("DB PASSWORD:", user.password)

    # 2. SAFETY CHECK
    if not user.password:
        raise HTTPException(status_code=500, detail="Password not set in DB")

    # 3. VERIFY PASSWORD
    is_valid = verify_password(password, user.password)

    print("PASSWORD MATCH:", is_valid)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 4. CREATE TOKEN
    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }