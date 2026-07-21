import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(os.path.dirname(__file__), "anomaly_model.pkl")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "api_dataset.csv")


class AnomalyDetector:
    def __init__(self):
        self.model = self._load_or_create_model()

    def _load_or_create_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                return joblib.load(MODEL_PATH)
            except Exception:
                pass

        # Fallback: Create and train model on dataset or synthetic features
        if os.path.exists(DATASET_PATH):
            df = pd.read_csv(DATASET_PATH)
            features = df[["requests", "avg_response_time", "error_rate"]]
        else:
            # Synthetic features fallback
            features = pd.DataFrame({
                "requests": np.random.randint(10, 500, 100),
                "avg_response_time": np.random.uniform(20.0, 300.0, 100),
                "error_rate": np.random.uniform(0.0, 5.0, 100),
            })

        model = IsolationForest(contamination=0.05, random_state=42)
        model.fit(features)
        try:
            joblib.dump(model, MODEL_PATH)
        except Exception:
            pass
        return model

    def train(self):
        if os.path.exists(DATASET_PATH):
            df = pd.read_csv(DATASET_PATH)
            features = df[["requests", "avg_response_time", "error_rate"]]
        else:
            features = pd.DataFrame({
                "requests": [100, 200, 150, 300, 50],
                "avg_response_time": [50.0, 80.0, 45.0, 120.0, 30.0],
                "error_rate": [0.0, 1.0, 0.5, 2.0, 0.0]
            })

        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.model.fit(features)
        joblib.dump(self.model, MODEL_PATH)
        print("Anomaly model trained successfully.")

    def predict(self, requests, response_time, error_rate):
        sample = pd.DataFrame(
            [[requests, response_time, error_rate]],
            columns=["requests", "avg_response_time", "error_rate"]
        )
        prediction = self.model.predict(sample)[0]
        score = self.model.decision_function(sample)[0]

        return {
            "is_anomaly": bool(prediction == -1),
            "score": float(round(score, 4))
        }

    def detect_anomalies_from_logs(self, logs):
        """
        Analyze a list of ApiLog ORM / dict objects and return list of anomaly alerts.
        """
        if not logs:
            return []

        anomalies = []
        # Calculate endpoint baseline stats
        endpoint_data = {}
        for log in logs:
            ep = log.endpoint if hasattr(log, 'endpoint') else log.get('endpoint', 'unknown')
            rt = log.response_time if hasattr(log, 'response_time') else log.get('response_time', 0.0)
            sc = log.status_code if hasattr(log, 'status_code') else log.get('status_code', 200)

            if ep not in endpoint_data:
                endpoint_data[ep] = {"times": [], "errors": 0, "total": 0}

            endpoint_data[ep]["times"].append(rt)
            endpoint_data[ep]["total"] += 1
            if sc >= 400:
                endpoint_data[ep]["errors"] += 1

        for ep, data in endpoint_data.items():
            avg_rt = sum(data["times"]) / len(data["times"]) if data["times"] else 0
            err_rate = (data["errors"] / data["total"]) * 100 if data["total"] > 0 else 0
            req_count = data["total"]

            res = self.predict(req_count, avg_rt, err_rate)

            # Heuristic check or ML anomaly check
            if res["is_anomaly"] or avg_rt > 500 or err_rate > 10:
                severity = "High" if err_rate > 20 or avg_rt > 1000 else "Medium"
                anomalies.append({
                    "endpoint": ep,
                    "type": "Latency Spike" if avg_rt > 300 else "High Error Rate",
                    "severity": severity,
                    "avg_response_time": round(avg_rt, 2),
                    "error_rate": round(err_rate, 2),
                    "requests": req_count,
                    "anomaly_score": res["score"],
                    "message": f"Anomaly detected on {ep}: Avg response {round(avg_rt, 1)}ms with {round(err_rate, 1)}% error rate."
                })

        return anomalies


if __name__ == "__main__":
    detector = AnomalyDetector()
    detector.train()