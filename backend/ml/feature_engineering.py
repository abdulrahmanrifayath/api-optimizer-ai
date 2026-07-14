import pandas as pd
from sklearn.preprocessing import LabelEncoder


class FeatureEngineering:

    def __init__(self, dataframe):
        self.df = dataframe.copy()

    def process(self):

        # ---------------------------------------
        # Convert Timestamp
        # ---------------------------------------

        self.df["timestamp"] = pd.to_datetime(self.df["timestamp"])

        self.df["hour"] = self.df["timestamp"].dt.hour
        self.df["day"] = self.df["timestamp"].dt.day
        self.df["weekday"] = self.df["timestamp"].dt.weekday

        # ---------------------------------------
        # Encode Endpoint
        # ---------------------------------------

        endpoint_encoder = LabelEncoder()

        self.df["endpoint_encoded"] = endpoint_encoder.fit_transform(
            self.df["endpoint"]
        )

        # ---------------------------------------
        # Encode HTTP Method
        # ---------------------------------------

        method_encoder = LabelEncoder()

        self.df["method_encoded"] = method_encoder.fit_transform(
            self.df["method"]
        )

        # ---------------------------------------
        # Error Flag
        # ---------------------------------------

        self.df["is_error"] = (
            self.df["status_code"] >= 400
        ).astype(int)

        # ---------------------------------------
        # Aggregate per Hour + Endpoint
        # ---------------------------------------

        grouped = (
            self.df
            .groupby(
                [
                    "hour",
                    "day",
                    "weekday",
                    "endpoint",
                    "endpoint_encoded"
                ]
            )
            .agg(
                requests=("id", "count"),
                avg_response_time=("response_time", "mean"),
                error_rate=("is_error", "mean")
            )
            .reset_index()
        )

        return grouped