import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest

MODEL_PATH = "backend/ml/anomaly_model.pkl"


class AnomalyDetector:

    def train(self):

        df = pd.read_csv("backend/ml/api_dataset.csv")

        features = df[
            [
                "requests",
                "avg_response_time",
                "error_rate"
            ]
        ]

        model = IsolationForest(
            contamination=0.05,
            random_state=42
        )

        model.fit(features)

        joblib.dump(model, MODEL_PATH)

        print("✅ Anomaly model trained successfully.")

    def predict(self, requests, response_time, error_rate):

        model = joblib.load(MODEL_PATH)

        sample = pd.DataFrame(
            [[requests, response_time, error_rate]],
            columns=[
                "requests",
                "avg_response_time",
                "error_rate"
            ]
        )

        prediction = model.predict(sample)[0]

        score = model.decision_function(sample)[0]

        return {
    "is_anomaly": bool(prediction == -1),
    "score": float(round(score, 4))
}


if __name__ == "__main__":

    detector = AnomalyDetector()

    detector.train()