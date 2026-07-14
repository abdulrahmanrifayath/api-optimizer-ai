from sqlalchemy import func

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog
from backend.ml.anomaly_detector import AnomalyDetector


class AnomalyService:

    def __init__(self):
        self.db = SessionLocal()
        self.detector = AnomalyDetector()

    def detect(self):

        # -------------------------
        # Latest endpoint
        # -------------------------

        latest = (
            self.db.query(ApiLog)
            .order_by(ApiLog.timestamp.desc())
            .first()
        )

        if latest is None:

            return {
                "status": "No Data"
            }

        endpoint = latest.endpoint

        # -------------------------
        # Current request count
        # -------------------------

        requests = (
            self.db.query(ApiLog)
            .filter(ApiLog.endpoint == endpoint)
            .count()
        )

        # -------------------------
        # Average response time
        # -------------------------

        avg_response = (
            self.db.query(
                func.avg(ApiLog.response_time)
            )
            .filter(ApiLog.endpoint == endpoint)
            .scalar()
        )

        if avg_response is None:
            avg_response = 0

        # -------------------------
        # Error Rate
        # -------------------------

        total = (
            self.db.query(ApiLog)
            .filter(ApiLog.endpoint == endpoint)
            .count()
        )

        errors = (
            self.db.query(ApiLog)
            .filter(
                ApiLog.endpoint == endpoint,
                ApiLog.status_code >= 400
            )
            .count()
        )

        error_rate = 0

        if total > 0:
            error_rate = errors / total

        # -------------------------
        # AI Prediction
        # -------------------------

        result = self.detector.predict(

            requests=requests,

            response_time=avg_response,

            error_rate=error_rate

        )

        return {

    "endpoint": str(endpoint),

    "requests": int(requests),

    "avg_response_time": float(round(avg_response, 4)),

    "error_rate": float(round(error_rate * 100, 2)),

    "anomaly": bool(result["is_anomaly"]),

    "score": float(result["score"])

}