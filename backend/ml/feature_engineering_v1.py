import pandas as pd
from sklearn.preprocessing import LabelEncoder


class FeatureEngineering:

    def __init__(self, dataframe):
        self.df = dataframe.copy()

    def process(self):

        # --------------------------
        # Convert timestamp
        # --------------------------

        self.df["timestamp"] = pd.to_datetime(self.df["timestamp"])

        self.df["hour"] = self.df["timestamp"].dt.hour
        self.df["day"] = self.df["timestamp"].dt.day
        self.df["weekday"] = self.df["timestamp"].dt.weekday

        # --------------------------
        # Encode endpoint
        # --------------------------

        endpoint_encoder = LabelEncoder()

        self.df["endpoint_encoded"] = endpoint_encoder.fit_transform(
            self.df["endpoint"]
        )

        # --------------------------
        # Encode HTTP Method
        # --------------------------

        method_encoder = LabelEncoder()

        self.df["method_encoded"] = method_encoder.fit_transform(
            self.df["method"]
        )

        # --------------------------
        # Success / Failure
        # --------------------------

        self.df["is_error"] = (
            self.df["status_code"] >= 400
        ).astype(int)

        return self.df