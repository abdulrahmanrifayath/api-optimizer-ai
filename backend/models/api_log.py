from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from datetime import datetime

from backend.database.database import Base


class ApiLog(Base):
    __tablename__ = "api_logs"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # API Request Info
    endpoint = Column(String(255), nullable=False, index=True)
    method = Column(String(10), nullable=False, index=True)

    # Telemetry Metrics
    status_code = Column(Integer, nullable=False, index=True)
    response_time = Column(Float, nullable=False)  # in milliseconds
    response_size = Column(Integer, nullable=True)  # in bytes

    # Client Information
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)

    # User Ownership / Context
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        Index("idx_api_logs_time_endpoint_status", "timestamp", "endpoint", "status_code"),
    )