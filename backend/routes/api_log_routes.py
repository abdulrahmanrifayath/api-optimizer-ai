import io
import csv
import json
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse, Response
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
# 3. GET CHARTS TELEMETRY DATA (Phase 4)
# =========================
@router.get("/charts")
def get_log_charts(
    hours: int = Query(24, ge=1, le=168, description="Time window in hours"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    user_logs = (
        db.query(ApiLog)
        .filter(
            (ApiLog.user_id == current_user.id) | (ApiLog.user_id.is_(None)),
            ApiLog.timestamp >= cutoff
        )
        .all()
    )

    # Group requests per hour & latency trend
    hourly_requests = {}
    hourly_latency = {}
    status_distribution = {"2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0}

    for log in user_logs:
        hour_key = log.timestamp.strftime("%H:00")
        hourly_requests[hour_key] = hourly_requests.get(hour_key, 0) + 1

        if hour_key not in hourly_latency:
            hourly_latency[hour_key] = []
        hourly_latency[hour_key].append(log.response_time)

        code = log.status_code
        if 200 <= code < 300:
            status_distribution["2xx"] += 1
        elif 300 <= code < 400:
            status_distribution["3xx"] += 1
        elif 400 <= code < 500:
            status_distribution["4xx"] += 1
        elif code >= 500:
            status_distribution["5xx"] += 1

    chart_timeline = []
    for h_key in sorted(hourly_requests.keys()):
        times = hourly_latency.get(h_key, [0])
        avg_rt = round(sum(times) / len(times), 2) if times else 0.0
        chart_timeline.append({
            "hour": h_key,
            "requests": hourly_requests[h_key],
            "avg_latency": avg_rt
        })

    total = len(user_logs)
    success_rate = round((sum(1 for l in user_logs if l.status_code < 400) / total) * 100, 2) if total > 0 else 100.0
    error_rate = round(100.0 - success_rate, 2)

    return {
        "timeline": chart_timeline,
        "status_distribution": status_distribution,
        "success_rate": success_rate,
        "error_rate": error_rate,
        "total_logs": total
    }


# =========================
# 4. GET ENDPOINT ANALYTICS (Phase 5)
# =========================
@router.get("/endpoints/analytics")
def get_endpoint_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_logs = (
        db.query(ApiLog)
        .filter((ApiLog.user_id == current_user.id) | (ApiLog.user_id.is_(None)))
        .all()
    )

    total_logs = len(user_logs)
    if total_logs == 0:
        return []

    ep_dict = {}
    for log in user_logs:
        ep = log.endpoint
        if ep not in ep_dict:
            ep_dict[ep] = {"times": [], "errors": 0, "total": 0}
        ep_dict[ep]["times"].append(log.response_time)
        ep_dict[ep]["total"] += 1
        if log.status_code >= 400:
            ep_dict[ep]["errors"] += 1

    analytics_list = []
    for ep, data in ep_dict.items():
        times = data["times"]
        avg_rt = round(sum(times) / len(times), 2) if times else 0.0
        min_rt = round(min(times), 2) if times else 0.0
        max_rt = round(max(times), 2) if times else 0.0
        err_pct = round((data["errors"] / data["total"]) * 100, 2) if data["total"] > 0 else 0.0
        usage_pct = round((data["total"] / total_logs) * 100, 2)

        analytics_list.append({
            "endpoint": ep,
            "total_requests": data["total"],
            "avg_latency": avg_rt,
            "min_latency": min_rt,
            "max_latency": max_rt,
            "error_percentage": err_pct,
            "usage_percentage": usage_pct
        })

    return sorted(analytics_list, key=lambda x: x["total_requests"], reverse=True)


# =========================
# 5. EXPORT TELEMETRY LOGS (Phase 6 - CSV, JSON, PDF)
# =========================
@router.get("/export")
def export_telemetry_logs(
    export_format: str = Query("csv", alias="format", description="Export format: csv, json, pdf"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    logs = (
        db.query(ApiLog)
        .filter((ApiLog.user_id == current_user.id) | (ApiLog.user_id.is_(None)))
        .order_by(ApiLog.timestamp.desc())
        .all()
    )

    if export_format.lower() == "json":
        data = [
            {
                "id": l.id,
                "timestamp": l.timestamp.isoformat(),
                "method": l.method,
                "endpoint": l.endpoint,
                "status_code": l.status_code,
                "response_time_ms": l.response_time,
                "response_size": l.response_size,
                "ip_address": l.ip_address,
                "user_agent": l.user_agent,
            }
            for l in logs
        ]
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": 'attachment; filename="api_telemetry_logs.json"'}
        )

    elif export_format.lower() == "pdf":
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph("<b>API Telemetry Logs Report</b>", styles['Heading1']))
        elements.append(Spacer(1, 12))

        table_data = [["Timestamp", "Method", "Endpoint", "Status", "Latency (ms)"]]
        for l in logs[:100]:  # Cap at 100 rows for PDF
            table_data.append([
                l.timestamp.strftime("%Y-%m-%d %H:%M"),
                l.method,
                l.endpoint[:30],
                str(l.status_code),
                f"{l.response_time}ms"
            ])

        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2563eb")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ]))
        elements.append(t)
        doc.build(elements)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="api_telemetry_report.pdf"'}
        )

    else:  # Default CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Timestamp", "Method", "Endpoint", "Status Code", "Response Time (ms)", "Size (Bytes)", "IP Address", "User Agent"])
        for l in logs:
            writer.writerow([
                l.id,
                l.timestamp.isoformat(),
                l.method,
                l.endpoint,
                l.status_code,
                l.response_time,
                l.response_size or "N/A",
                l.ip_address or "N/A",
                l.user_agent or "N/A"
            ])
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="api_telemetry_logs.csv"'}
        )


# =========================
# 6. GET PAGINATED LOGS
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
# 7. TELEMETRY STATS
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
# 8. CLEAR LOGS
# =========================
@router.delete("/clear")
def clear_user_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(ApiLog).filter(ApiLog.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All user logs purged successfully."}
