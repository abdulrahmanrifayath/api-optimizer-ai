import time
import requests
import socket
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    ConnectedAPIPaginatedResponse,
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
# SUMMARY STATS (GET /connected-apis/summary)
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
    active_count = sum(1 for api in user_apis if api.status not in ["Inactive"])
    healthy_count = sum(1 for api in user_apis if api.status in ["Healthy", "Active"])
    slow_count = sum(1 for api in user_apis if api.status == "Slow")
    offline_count = sum(1 for api in user_apis if api.status in ["Offline", "Timeout", "SSL Error", "Unauthorized"])
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
        healthy_apis=healthy_count,
        slow_apis=slow_count,
        offline_apis=offline_count,
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
            detail="API with this base URL is already connected."
        )

    new_api = ConnectedAPI(
        name=api.name,
        base_url=str(api.base_url),
        description=api.description,
        status="Healthy",
        user_id=current_user.id
    )

    db.add(new_api)
    db.commit()
    db.refresh(new_api)

    return new_api


# =========================
# GET CONNECTED APIS (SEARCH, FILTER, SORT, PAGINATION)
# =========================
@router.get("/", response_model=ConnectedAPIPaginatedResponse)
def get_connected_apis(
    query_str: Optional[str] = Query(None, alias="query", description="Search by name or URL"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    sort_by: Optional[str] = Query("newest", description="Sort order: newest, oldest, fastest, slowest"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(ConnectedAPI).filter(ConnectedAPI.user_id == current_user.id)

    if query_str:
        search_pattern = f"%{query_str}%"
        query = query.filter(
            (ConnectedAPI.name.ilike(search_pattern)) | (ConnectedAPI.base_url.ilike(search_pattern))
        )

    if status_filter and status_filter != "All":
        query = query.filter(ConnectedAPI.status == status_filter)

    if sort_by == "oldest":
        query = query.order_by(ConnectedAPI.created_at.asc())
    elif sort_by == "fastest":
        query = query.order_by(ConnectedAPI.latency.asc())
    elif sort_by == "slowest":
        query = query.order_by(ConnectedAPI.latency.desc())
    else:  # newest default
        query = query.order_by(ConnectedAPI.created_at.desc())

    total_items = query.count()
    total_pages = max(1, (total_items + limit - 1) // limit)

    items = (
        query.offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return ConnectedAPIPaginatedResponse(
        items=items,
        total=total_items,
        page=page,
        limit=limit,
        total_pages=total_pages,
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
# STATUS TOGGLE (PATCH /connected-apis/{id}/status)
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

    api.status = status_update.status
    db.commit()
    db.refresh(api)
    return api


# =========================
# ADVANCED API CONNECTIVITY TEST (POST /connected-apis/{id}/test & POST /connected-apis/test/{id})
# =========================
@router.post("/{api_id}/test", response_model=TestConnectionResponse)
@router.post("/test/{api_id}", response_model=TestConnectionResponse)
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

    # 1. DNS Resolution check
    parsed = urlparse(api.base_url)
    hostname = parsed.hostname or api.base_url.replace("https://", "").replace("http://", "").split("/")[0]

    try:
        socket.gethostbyname(hostname)
    except socket.gaierror:
        api.status = "Offline"
        api.last_checked = checked_at_dt
        api.failure_count = (api.failure_count or 0) + 1
        api.total_checks = (api.total_checks or 0) + 1
        api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)
        db.commit()
        return TestConnectionResponse(
            status="Offline",
            checked_at=checked_at_str,
            error=f"DNS Resolution failed for host: {hostname}"
        )

    # 2. HTTP Request execution & SSL Verification
    start_time = time.time()
    ssl_ok = True
    try:
        response = requests.get(
            api.base_url,
            timeout=6.0,
            headers={"User-Agent": "API-Optimizer-AI/2.0 Health Monitor"}
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        status_code = response.status_code
        response_size = len(response.content)

        # Categorize health status
        if status_code in [401, 403]:
            computed_status = "Unauthorized"
            is_failure = True
        elif status_code >= 400:
            computed_status = "Offline"
            is_failure = True
        elif elapsed_ms >= 500:
            computed_status = "Slow"
            is_failure = False
        else:
            computed_status = "Healthy"
            is_failure = False

        # Update API state
        api.status = computed_status
        api.last_checked = checked_at_dt
        api.latency = elapsed_ms
        api.total_checks = (api.total_checks or 0) + 1
        if is_failure:
            api.failure_count = (api.failure_count or 0) + 1
        api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)
        api.ssl_verified = True

        # Update average response time
        metrics_avg = (
            db.query(func.avg(ConnectedApiMetric.response_time))
            .filter(ConnectedApiMetric.connected_api_id == api.id)
            .scalar()
        )
        api.avg_response_time = round(float(metrics_avg), 2) if metrics_avg is not None else elapsed_ms

        # Store metric entry
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
            status=computed_status,
            status_code=status_code,
            response_time=elapsed_ms,
            ssl_verified=True,
            checked_at=checked_at_str
        )

    except requests.exceptions.SSLError as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        api.status = "SSL Error"
        api.last_checked = checked_at_dt
        api.ssl_verified = False
        api.total_checks = (api.total_checks or 0) + 1
        api.failure_count = (api.failure_count or 0) + 1
        api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)
        db.commit()
        return TestConnectionResponse(
            status="SSL Error",
            ssl_verified=False,
            checked_at=checked_at_str,
            error=str(e)
        )

    except requests.exceptions.Timeout as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        api.status = "Timeout"
        api.last_checked = checked_at_dt
        api.total_checks = (api.total_checks or 0) + 1
        api.failure_count = (api.failure_count or 0) + 1
        api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)
        db.commit()
        return TestConnectionResponse(
            status="Timeout",
            checked_at=checked_at_str,
            error="Connection timed out after 6 seconds."
        )

    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        api.status = "Offline"
        api.last_checked = checked_at_dt
        api.total_checks = (api.total_checks or 0) + 1
        api.failure_count = (api.failure_count or 0) + 1
        api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)
        db.commit()
        return TestConnectionResponse(
            status="Offline",
            checked_at=checked_at_str,
            error=str(e)
        )


# =========================
# GET API METRICS HISTORY
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

    return (
        db.query(ConnectedApiMetric)
        .filter(ConnectedApiMetric.connected_api_id == api_id)
        .order_by(ConnectedApiMetric.checked_at.desc())
        .limit(100)
        .all()
    )


# =========================
# HISTORICAL CHARTS METRICS (1h, 24h, 7d, 30d)
# =========================
@router.get("/metrics/historical")
def get_historical_metrics(
    api_id: Optional[int] = Query(None, description="Filter by API ID"),
    time_window: str = Query("24h", description="1h, 24h, 7d, 30d"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from datetime import timedelta
    now = datetime.utcnow()

    if time_window == "1h":
        cutoff = now - timedelta(hours=1)
    elif time_window == "7d":
        cutoff = now - timedelta(days=7)
    elif time_window == "30d":
        cutoff = now - timedelta(days=30)
    else:  # 24h default
        cutoff = now - timedelta(hours=24)

    user_api_ids = [api.id for api in db.query(ConnectedAPI).filter(ConnectedAPI.user_id == current_user.id).all()]
    if not user_api_ids:
        return {"timeline": [], "summary": {"avg_latency": 0, "error_rate": 0, "total_requests": 0}}

    query = db.query(ConnectedApiMetric).filter(
        ConnectedApiMetric.connected_api_id.in_(user_api_ids),
        ConnectedApiMetric.checked_at >= cutoff
    )

    if api_id:
        query = query.filter(ConnectedApiMetric.connected_api_id == api_id)

    metrics = query.order_by(ConnectedApiMetric.checked_at.asc()).all()

    timeline = [
        {
            "id": m.id,
            "api_id": m.connected_api_id,
            "response_time": m.response_time,
            "status_code": m.status_code,
            "request_size": m.request_size or 0,
            "response_size": m.response_size or 0,
            "error_type": m.error_type,
            "timestamp": m.checked_at.isoformat()
        }
        for m in metrics
    ]

    total_reqs = len(metrics)
    avg_latency = round(sum(m.response_time for m in metrics) / total_reqs, 2) if total_reqs > 0 else 0.0
    err_count = sum(1 for m in metrics if m.error_type is not None or (m.status_code and m.status_code >= 400))
    err_rate = round((err_count / total_reqs) * 100, 2) if total_reqs > 0 else 0.0

    return {
        "timeline": timeline,
        "summary": {
            "avg_latency": avg_latency,
            "error_rate": err_rate,
            "total_requests": total_reqs,
            "time_window": time_window
        }
    }


# =========================
# MODULE 4: ERROR DETECTION SUMMARY
# =========================
@router.get("/errors/summary")
def get_error_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from backend.models.error_log import ErrorLog

    user_api_ids = [api.id for api in db.query(ConnectedAPI).filter(ConnectedAPI.user_id == current_user.id).all()]
    if not user_api_ids:
        return []

    errors = (
        db.query(ErrorLog)
        .filter(ErrorLog.connected_api_id.in_(user_api_ids))
        .order_by(ErrorLog.timestamp.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": err.id,
            "api_id": err.connected_api_id,
            "error_type": err.error_type,
            "status_code": err.status_code,
            "message": err.message,
            "frequency": err.frequency,
            "timestamp": err.timestamp.isoformat()
        }
        for err in errors
    ]


# =========================
# TOGGLE MONITORING (PATCH /connected-apis/{id}/monitoring)
# =========================
@router.patch("/{api_id}/monitoring")
def toggle_api_monitoring(
    api_id: int,
    is_monitored: bool = Query(..., description="Enable or disable monitoring"),
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

    api.is_monitored = is_monitored
    db.commit()
    return {"message": f"Monitoring {'enabled' if is_monitored else 'disabled'} for {api.name}"}