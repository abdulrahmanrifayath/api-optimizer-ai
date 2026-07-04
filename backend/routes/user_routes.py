from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.user import User
from backend.schemas.user_schema import UserCreate, UserResponse
from backend.utils.password_utils import hash_password

# 🔐 JWT AUTH
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


# =========================
# CREATE USER (PUBLIC)
# =========================
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)  # ✅ correct
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# GET ALL USERS (PROTECTED)
# =========================
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(User).all()


# =========================
# GET USER BY ID (PROTECTED)
# =========================
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_data = db.query(User).filter(User.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return user_data


# =========================
# UPDATE USER (PROTECTED)
# =========================
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    updated_user: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_data = db.query(User).filter(User.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    user_data.name = updated_user.name
    user_data.email = updated_user.email
    user_data.password = hash_password(updated_user.password)  # ✅ correct

    db.commit()
    db.refresh(user_data)

    return user_data


# =========================
# DELETE USER (PROTECTED)
# =========================
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_data = db.query(User).filter(User.id == user_id).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user_data)
    db.commit()

    return {"message": "User deleted successfully"}