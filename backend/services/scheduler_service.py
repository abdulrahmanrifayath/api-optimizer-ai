import time
import requests
import socket
from datetime import datetime
from urllib.parse import urlparse
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from backend.database.database import SessionLocal
from backend.models.connected_api import ConnectedAPI
from backend.models.connected_api_metric import ConnectedApiMetric
from backend.models.error_log import ErrorLog

scheduler = BackgroundScheduler()


def poll_connected_api(db: Session, api: ConnectedAPI):
    checked_at_dt = datetime.utcnow()
    headers = {"User-Agent": "API-Optimizer-AI Scheduler/2.0 Monitor"}

    if api.api_key:
        if api.auth_header:
            headers[api.auth_header] = api.api_key
        else:
            headers["Authorization"] = f"Bearer {api.api_key}"

    parsed = urlparse(api.base_url)
    hostname = parsed.hostname or api.base_url.replace("https://", "").replace("http://", "").split("/")[0]

    # DNS Check
    try:
        socket.gethostbyname(hostname)
    except socket.gaierror as e:
        _handle_api_failure(db, api, error_type="DNS Failed", message=f"DNS lookup failed for {hostname}", checked_at=checked_at_dt)
        return

    start_time = time.time()
    request_size = len(str(headers).encode('utf-8'))

    try:
        response = requests.get(api.base_url, headers=headers, timeout=5.0)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        status_code = response.status_code
        response_size = len(response.content)

        error_type = None
        if status_code >= 500:
            error_type = "5xx"
        elif status_code >= 400:
            error_type = "4xx"

        is_failure = error_type is not None

        # Determine Health Status: Healthy, Warning, Critical, Offline
        if is_failure:
            if status_code >= 500:
                health_status = "Critical"
            else:
                health_status = "Warning"
        elif elapsed_ms > 800:
            health_status = "Warning"
        else:
            health_status = "Healthy"

        api.status = health_status
        api.last_checked = checked_at_dt
        api.latency = elapsed_ms
        api.ssl_verified = True
        api.total_checks = (api.total_checks or 0) + 1
        if is_failure:
            api.failure_count = (api.failure_count or 0) + 1
        api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)

        # Record Metric
        metric = ConnectedApiMetric(
            connected_api_id=api.id,
            status_code=status_code,
            response_time=elapsed_ms,
            request_size=request_size,
            response_size=response_size,
            error_type=error_type,
            checked_at=checked_at_dt
        )
        db.add(metric)

        # Record Error Log if error
        if is_failure:
            err_log = ErrorLog(
                connected_api_id=api.id,
                error_type=error_type,
                status_code=status_code,
                message=f"HTTP {status_code} response received",
                timestamp=checked_at_dt
            )
            db.add(err_log)

        db.commit()

    except requests.exceptions.SSLError as e:
        _handle_api_failure(db, api, error_type="SSL Error", message=str(e), checked_at=checked_at_dt)
    except requests.exceptions.Timeout as e:
        _handle_api_failure(db, api, error_type="Timeout", message="Request timed out after 5.0 seconds", checked_at=checked_at_dt)
    except Exception as e:
        _handle_api_failure(db, api, error_type="Connection Failed", message=str(e), checked_at=checked_at_dt)


def _handle_api_failure(db: Session, api: ConnectedAPI, error_type: str, message: str, checked_at: datetime):
    api.status = "Offline" if error_type in ["Connection Failed", "DNS Failed"] else "Critical"
    api.last_checked = checked_at
    api.total_checks = (api.total_checks or 0) + 1
    api.failure_count = (api.failure_count or 0) + 1
    api.availability = round(((api.total_checks - api.failure_count) / api.total_checks) * 100, 1)

    metric = ConnectedApiMetric(
        connected_api_id=api.id,
        status_code=None,
        response_time=0.0,
        request_size=0,
        response_size=0,
        error_type=error_type,
        checked_at=checked_at
    )
    db.add(metric)

    err_log = ErrorLog(
        connected_api_id=api.id,
        error_type=error_type,
        status_code=None,
        message=message,
        timestamp=checked_at
    )
    db.add(err_log)
    db.commit()


def run_scheduler_polling_job():
    db = SessionLocal()
    try:
        apis = db.query(ConnectedAPI).filter(ConnectedAPI.is_monitored == True).all()
        for api in apis:
            poll_connected_api(db, api)
    except Exception as e:
        print(f"[Scheduler] Polling job error: {e}")
    finally:
        db.close()


def start_monitoring_scheduler():
    if not scheduler.running:
        scheduler.add_job(run_scheduler_polling_job, "interval", minutes=1, id="api_monitoring_poll_job", replace_existing=True)
        scheduler.start()
        print("[Scheduler] APScheduler Background Monitoring Service started (Polling every 1 minute).")


def stop_monitoring_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] APScheduler Background Monitoring Service stopped.")
