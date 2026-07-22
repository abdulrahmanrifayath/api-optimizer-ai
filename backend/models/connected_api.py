from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database.database import Base


class ConnectedAPI(Base):
    __tablename__ = "connected_apis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    base_url = Column(String(500), nullable=False)
    description = Column(String(500), nullable=True)

    # API Credentials & Connector Config
    api_key = Column(String(500), nullable=True)
    auth_header = Column(String(255), nullable=True)
    is_monitored = Column(Boolean, default=True)

    # Health & Telemetry status: Healthy, Warning, Critical, Offline, Slow, Timeout, SSL Error
    status = Column(String(30), default="Healthy", index=True)
    last_checked = Column(DateTime, nullable=True)
    latency = Column(Float, default=0.0)  # in milliseconds
    availability = Column(Float, default=100.0)  # availability percentage (0-100%)
    avg_response_time = Column(Float, default=0.0)
    failure_count = Column(Integer, default=0)
    total_checks = Column(Integer, default=0)
    ssl_verified = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    metrics = relationship("ConnectedApiMetric", back_populates="connected_api", cascade="all, delete-orphan")
    error_logs = relationship("ErrorLog", back_populates="connected_api", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_connected_apis_user_status", "user_id", "status"),
    )