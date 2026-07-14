import joblib
import pandas as pd

MODEL_PATH = "backend/ml/traffic_model.pkl"

model = joblib.load(MODEL_PATH)


def predict_next_hour(features: dict):

    df = pd.DataFrame([features])

    prediction = model.predict(df)[0]

    return round(float(prediction), 2)