from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.connected_api import ConnectedAPI
from backend.schemas.connected_api import (
    ConnectedAPICreate,
    ConnectedAPIResponse
)

# JWT Authentication
from backend.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/connected-apis",
    tags=["Connected APIs"]
)


# =========================
# CREATE CONNECTED API
# =========================
@router.post("/", response_model=ConnectedAPIResponse)
def create_connected_api(
    api: ConnectedAPICreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing_api = (
        db.query(ConnectedAPI)
        .filter(
            ConnectedAPI.base_url == str(api.base_url),
            ConnectedAPI.user_id == current_user.id
        )
        .first()
    )

    if existing_api:
        raise HTTPException(
            status_code=400,
            detail="API already connected."
        )

    new_api = ConnectedAPI(
        name=api.name,
        base_url=str(api.base_url),
        description=api.description,
        user_id=current_user.id
    )

    db.add(new_api)
    db.commit()
    db.refresh(new_api)

    return new_api


# =========================
# GET ALL CONNECTED APIS
# =========================
@router.get("/", response_model=list[ConnectedAPIResponse])
def get_connected_apis(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return (
        db.query(ConnectedAPI)
        .filter(
            ConnectedAPI.user_id == current_user.id
        )
        .all()
    )