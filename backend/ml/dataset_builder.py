import pandas as pd
from sqlalchemy.orm import Session

from backend.database.database import SessionLocal
from backend.models.api_log import ApiLog
from backend.ml.feature_engineering import FeatureEngineering


class DatasetBuilder:

    def __init__(self):
        self.db: Session = SessionLocal()

    def load_logs(self):

        logs = self.db.query(ApiLog).all()

        data = []

        for log in logs:
            data.append({
                "id": log.id,
                "endpoint": log.endpoint,
                "method": log.method,
                "status_code": log.status_code,
                "response_time": log.response_time,
                "timestamp": log.timestamp
            })

        return pd.DataFrame(data)

    def save_csv(self, filename="backend/ml/api_dataset.csv"):

        df = self.load_logs()

        engineer = FeatureEngineering(df)

        df = engineer.process()

        df.to_csv(filename, index=False)

        print(f"✅ Dataset saved successfully ({len(df)} rows).")

        return df


if __name__ == "__main__":

    builder = DatasetBuilder()

    builder.save_csv()