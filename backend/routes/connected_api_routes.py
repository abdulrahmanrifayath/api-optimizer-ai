import time
import requests
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.database import get_db
from backend.models.connected_api import ConnectedAPI
from backend.models.connected_api_metric import ConnectedApiMetric
from backend.schemas.connected_api import (
    ConnectedAPICreate,
    ConnectedAPIUpdate,
    ConnectedAPIStatusUpdate,
    ConnectedAPIResponse,
    TestConnectionResponse,
    ConnectedApiMetricResponse,
    ConnectedApiSummaryResponse,
)
from backend.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/connected-apis",
    tags=["Connected APIs"]
)


# =========================
# SUMMARY STATS (MUST BE BEFORE /{id})
# =========================
@router.get("/summary", response_model=ConnectedApiSummaryResponse)
def get_connected_apis_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_apis = (
        db.query(ConnectedAPI)
        .filter(ConnectedAPI.user_id == current_user.id)
        .all()
    )

    total_connected = len(user_apis)
    active_count = sum(1 for api in user_apis if api.status == "Active")
    inactive_count = sum(1 for api in user_apis if api.status == "Inactive")

    user_api_ids = [api.id for api in user_apis]

    avg_res_time = 0.0
    last_check = None

    if user_api_ids:
        avg_result = (
            db.query(func.avg(ConnectedApiMetric.response_time))
            .filter(ConnectedApiMetric.connected_api_id.in_(user_api_ids))
            .scalar()
        )
        if avg_result is not None:
            avg_res_time = round(float(avg_result), 2)

        latest_metric = (
            db.query(ConnectedApiMetric)
            .filter(ConnectedApiMetric.connected_api_id.in_(user_api_ids))
            .order_by(ConnectedApiMetric.checked_at.desc())
            .first()
        )
        if latest_metric:
            last_check = latest_metric.checked_at

    return ConnectedApiSummaryResponse(
        total_connected_apis=total_connected,
        active_apis=active_count,
        inactive_apis=inactive_count,
        average_response_time=avg_res_time,
        last_connection_check=last_check,
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
        .filter(ConnectedAPI.user_id == current_user.id)
        .all()
    )


# =========================
# UPDATE CONNECTED API
# =========================
@router.put("/{api_id}", response_model=ConnectedAPIResponse)
def update_connected_api(
    api_id: int,
    api_update: ConnectedAPIUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    api = (
        db.query(ConnectedAPI)
        .filter(ConnectedAPI.id == api_id, ConnectedAPI.user_id == current_user.id)
        .first()
    )

    if not api:
        raise HTTPException(status_code=404, detail="Connected API not found.")

    if api_update.name is not None:
        api.name = api_update.name
    if api_update.base_url is not None:
        api.base_url = str(api_update.base_url)
    if api_update.description is not None:
        api.description = api_update.description

    db.commit()
    db.refresh(api)
    return api


# =========================
# DELETE CONNECTED API
# =========================
@router.delete("/{api_id}")
def delete_connected_api(
    api_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    api = (
        db.query(ConnectedAPI)
        .filter(ConnectedAPI.id == api_id, ConnectedAPI.user_id == current_user.id)
        .first()
    )

    if not api:
        raise HTTPException(status_code=404, detail="Connected API not found.")

    db.delete(api)
    db.commit()
    return {"message": "API deleted successfully."}


# =========================
# STEP 1: STATUS TOGGLE (PATCH /connected-apis/{id}/status)
# =========================
@router.patch("/{api_id}/status", response_model=ConnectedAPIResponse)
def update_api_status(
    api_id: int,
    status_update: ConnectedAPIStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    api = (
        db.query(ConnectedAPI)
        .filter(ConnectedAPI.id == api_id, ConnectedAPI.user_id == current_user.id)
        .first()
    )

    if not api:
        raise HTTPException(status_code=404, detail="Connected API not found.")

    if status_update.status not in ["Active", "Inactive"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'Active' or 'Inactive'.")

    api.status = status_update.status
    db.commit()
    db.refresh(api)

    return api


# =========================
# STEP 2 & STEP 3: TEST API CONNECTION & STORE METRICS
# (POST /connected-apis/{id}/test)
# =========================
@router.post("/{api_id}/test", response_model=TestConnectionResponse)
def test_api_connection(
    api_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    api = (
        db.query(ConnectedAPI)
        .filter(ConnectedAPI.id == api_id, ConnectedAPI.user_id == current_user.id)
        .first()
    )

    if not api:
        raise HTTPException(status_code=404, detail="Connected API not found.")

    checked_at_dt = datetime.utcnow()
    checked_at_str = checked_at_dt.isoformat()

    start_time = time.time()
    try:
        response = requests.get(
            api.base_url,
            timeout=5.0,
            headers={"User-Agent": "API-Optimizer-AI/1.0"}
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        status_code = response.status_code
        response_size = len(response.content)

        # Store metric record
        metric = ConnectedApiMetric(
            connected_api_id=api.id,
            status_code=status_code,
            response_time=elapsed_ms,
            response_size=response_size,
            checked_at=checked_at_dt
        )
        db.add(metric)
        db.commit()

        return TestConnectionResponse(
            status="Connected",
            status_code=status_code,
            response_time=elapsed_ms,
            checked_at=checked_at_str
        )

    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        # Store failed metric record
        metric = ConnectedApiMetric(
            connected_api_id=api.id,
            status_code=0,
            response_time=elapsed_ms,
            response_size=0,
            checked_at=checked_at_dt
        )
        db.add(metric)
        db.commit()

        return TestConnectionResponse(
            status="Failed",
            error=str(e),
            checked_at=checked_at_str
        )


# =========================
# STEP 3: GET METRICS (GET /connected-apis/{id}/metrics)
# =========================
@router.get("/{api_id}/metrics", response_model=list[ConnectedApiMetricResponse])
def get_connected_api_metrics(
    api_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    api = (
        db.query(ConnectedAPI)
        .filter(ConnectedAPI.id == api_id, ConnectedAPI.user_id == current_user.id)
        .first()
    )

    if not api:
        raise HTTPException(status_code=404, detail="Connected API not found.")

    metrics = (
        db.query(ConnectedApiMetric)
        .filter(ConnectedApiMetric.connected_api_id == api_id)
        .order_by(ConnectedApiMetric.checked_at.desc())
        .limit(100)
        .all()
    )

    return metrics