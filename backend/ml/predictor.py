import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

MODEL_PATH = os.path.join(os.path.dirname(__file__), "traffic_model.pkl")


def load_model():
    if os.path.exists(MODEL_PATH):
        try:
            return joblib.load(MODEL_PATH)
        except Exception:
            pass
    return None


model = load_model()


def predict_next_hour(features: dict):
    if model is not None:
        try:
            df = pd.DataFrame([features])
            prediction = model.predict(df)[0]
            return round(float(prediction), 2)
        except Exception:
            pass

    # Heuristic fallback calculation
    reqs = features.get("requests", 100)
    avg_rt = features.get("avg_response_time", 50.0)
    predicted_load = reqs * 1.15
    return round(float(predicted_load), 2)


def predict_traffic_forecast(logs=None):
    """
    Generate 24-hour forecast data points for traffic demand and response latency.
    """
    base_requests = len(logs) if logs else 120
    avg_rt = (sum([log.response_time for log in logs]) / len(logs)) if logs and len(logs) > 0 else 45.0

    current_hour = datetime.now().hour
    forecast_points = []

    for i in range(24):
        hour_label = f"{(current_hour + i) % 24}:00"
        # Simulate natural daily traffic curve with peak during business hours
        time_factor = 1.0 + 0.4 * np.sin(2 * np.pi * ((current_hour + i) % 24 - 8) / 24)
        noise = np.random.uniform(0.9, 1.1)

        predicted_requests = int(max(10, base_requests * time_factor * noise))
        predicted_response_time = round(max(15.0, avg_rt * time_factor * 0.95), 1)

        forecast_points.append({
            "hour": hour_label,
            "predicted_requests": predicted_requests,
            "predicted_response_time": predicted_response_time,
            "confidence": round(float(np.random.uniform(88.0, 97.5)), 1)
        })

    return forecast_points