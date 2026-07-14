from datetime import datetime

import pandas as pd
from sqlalchemy import func

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog
from backend.ml.predictor import predict_next_hour


class PredictionService:

    def __init__(self):
        self.db = SessionLocal()

    def get_prediction(self):

        now = datetime.now()

        # Latest endpoint
        latest = (
            self.db.query(ApiLog)
            .order_by(ApiLog.timestamp.desc())
            .first()
        )

        endpoint = latest.endpoint if latest else "/"

        # Total requests for this endpoint
        request_count = (
            self.db.query(ApiLog)
            .filter(ApiLog.endpoint == endpoint)
            .count()
        )

        # Average response time
        avg_response = (
            self.db.query(func.avg(ApiLog.response_time))
            .filter(ApiLog.endpoint == endpoint)
            .scalar()
        )

        if avg_response is None:
            avg_response = 0.20

        # Error rate
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

        # Build features
        features = {

            "hour": now.hour,

            "day": now.day,

            "weekday": now.weekday(),

            "endpoint_encoded": 0,

            "avg_response_time": avg_response,

            "error_rate": error_rate

        }

        prediction = predict_next_hour(features)

        trend = "Stable"

        if prediction > request_count:
            trend = "Increasing"

        elif prediction < request_count:
            trend = "Decreasing"

        return {

            "endpoint": endpoint,

            "current_requests": request_count,

            "predicted_requests": prediction,

            "trend": trend,

            "avg_response_time": round(avg_response, 4),

            "error_rate": round(error_rate * 100, 2)

        }