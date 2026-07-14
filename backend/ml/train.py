import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

MODEL_PATH = "backend/ml/traffic_model.pkl"


def train():

    df = pd.read_csv("backend/ml/api_dataset.csv")

    # ---------------------------------
    # Predict NEXT HOUR Requests
    # ---------------------------------

    df["target"] = df["requests"].shift(-1)

    df = df.dropna()

    features = [
        "hour",
        "day",
        "weekday",
        "endpoint_encoded",
        "avg_response_time",
        "error_rate"
    ]

    X = df[features]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)

    print("\n" + "=" * 50)
    print("🚀 Traffic Prediction Model Trained")
    print("=" * 50)
    print(f"Mean Absolute Error : {mae:.2f}")
    print("=" * 50)

    joblib.dump(model, MODEL_PATH)

    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()