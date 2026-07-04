from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog


def fetch_logs():
    """
    Fetch all API logs from database safely.
    """
    db = SessionLocal()
    try:
        logs = db.query(ApiLog).all()
        return logs
    finally:
        db.close()