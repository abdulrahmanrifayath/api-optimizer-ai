from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.database import get_db
from backend.models.api_log import ApiLog
from backend.schemas.api_log_schema import (
    ApiLogCreate,
    ApiLogBatchCreate,
    ApiLogResponse,
    ApiLogPaginatedResponse,
    ApiLogStatsResponse,
)
from backend.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/api/v1/logs",
    tags=["API Telemetry Logs"]
)


# =========================
# 1. INGEST SINGLE LOG
# =========================
@router.post("/ingest", response_model=ApiLogResponse, status_code=status.HTTP_201_CREATED)
def ingest_single_log(
    log_data: ApiLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_log = ApiLog(
        endpoint=log_data.endpoint,
        method=log_data.method.upper(),
        status_code=log_data.status_code,
        response_time=log_data.response_time,
        response_size=log_data.response_size,
        ip_address=log_data.ip_address,
        user_agent=log_data.user_agent,
        user_id=current_user.id,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


# =========================
# 2. INGEST BATCH LOGS
# =========================
@router.post("/ingest/batch", status_code=status.HTTP_201_CREATED)
def ingest_batch_logs(
    batch_data: ApiLogBatchCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not batch_data.logs:
        raise HTTPException(status_code=400, detail="Batch logs list cannot be empty.")

    log_objects = [
        ApiLog(
            endpoint=item.endpoint,
            method=item.method.upper(),
            status_code=item.status_code,
            response_time=item.response_time,
            response_size=item.response_size,
            ip_address=item.ip_address,
            user_agent=item.user_agent,
            user_id=current_user.id,
        )
        for item in batch_data.logs
    ]

    db.bulk_save_objects(log_objects)
    db.commit()
    return {"message": f"Successfully ingested {len(log_objects)} API logs."}


# =========================
# 3. GET PAGINATED & FILTERED LOGS
# =========================
@router.get("/", response_model=ApiLogPaginatedResponse)
def get_telemetry_logs(
    endpoint: Optional[str] = Query(None, description="Filter by endpoint path"),
    method: Optional[str] = Query(None, description="Filter by HTTP method"),
    status_code: Optional[int] = Query(None, description="Filter by exact status code"),
    status_category: Optional[str] = Query(None, description="Filter category: 2xx, 3xx, 4xx, 5xx"),
    start_date: Optional[datetime] = Query(None, description="Filter from timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter to timestamp"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(ApiLog).filter(
        (ApiLog.user_id == current_user.id) | (ApiLog.user_id.is_(None))
    )

    if endpoint:
        query = query.filter(ApiLog.endpoint.ilike(f"%{endpoint}%"))

    if method:
        query = query.filter(ApiLog.method == method.upper())

    if status_code:
        query = query.filter(ApiLog.status_code == status_code)

    if status_category:
        if status_category == "2xx":
            query = query.filter(ApiLog.status_code >= 200, ApiLog.status_code < 300)
        elif status_category == "3xx":
            query = query.filter(ApiLog.status_code >= 300, ApiLog.status_code < 400)
        elif status_category == "4xx":
            query = query.filter(ApiLog.status_code >= 400, ApiLog.status_code < 500)
        elif status_category == "5xx":
            query = query.filter(ApiLog.status_code >= 500)

    if start_date:
        query = query.filter(ApiLog.timestamp >= start_date)

    if end_date:
        query = query.filter(ApiLog.timestamp <= end_date)

    total_items = query.count()
    total_pages = max(1, (total_items + limit - 1) // limit)

    items = (
        query.order_by(ApiLog.timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return ApiLogPaginatedResponse(
        items=items,
        total=total_items,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


# =========================
# 4. TELEMETRY LOG STATS
# =========================
@router.get("/stats", response_model=ApiLogStatsResponse)
def get_telemetry_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_logs_query = db.query(ApiLog).filter(
        (ApiLog.user_id == current_user.id) | (ApiLog.user_id.is_(None))
    )

    total_logs = user_logs_query.count()
    success_count = user_logs_query.filter(ApiLog.status_code >= 200, ApiLog.status_code < 400).count()
    error_count = user_logs_query.filter(ApiLog.status_code >= 400).count()

    avg_time_scalar = user_logs_query.with_entities(func.avg(ApiLog.response_time)).scalar()
    avg_response_time = round(float(avg_time_scalar), 2) if avg_time_scalar is not None else 0.0

    # Status code breakdown
    breakdown_rows = (
        user_logs_query.with_entities(ApiLog.status_code, func.count(ApiLog.id))
        .group_by(ApiLog.status_code)
        .all()
    )
    breakdown_dict = {str(code): count for code, count in breakdown_rows}

    return ApiLogStatsResponse(
        total_logs=total_logs,
        success_count=success_count,
        error_count=error_count,
        avg_response_time=avg_response_time,
        status_code_breakdown=breakdown_dict,
    )


# =========================
# 5. CLEAR LOGS
# =========================
@router.delete("/clear")
def clear_user_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(ApiLog).filter(ApiLog.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All user logs purged successfully."}
