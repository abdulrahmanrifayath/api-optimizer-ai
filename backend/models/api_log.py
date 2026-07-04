from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from backend.database.database import Base


class ApiLog(Base):
    __tablename__ = "api_logs"

    # 🔑 Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # 🌐 API Info
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)

    # 📊 Response Metrics
    status_code = Column(Integer, nullable=False)
    response_time = Column(Float, nullable=False)

    # 🕒 Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)