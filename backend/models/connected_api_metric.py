from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database.database import Base


class ConnectedApiMetric(Base):
    __tablename__ = "connected_api_metrics"

    id = Column(Integer, primary_key=True, index=True)
    connected_api_id = Column(
        Integer, ForeignKey("connected_apis.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status_code = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=False)  # in milliseconds
    request_size = Column(Integer, default=0)       # in bytes
    response_size = Column(Integer, default=0)      # in bytes
    error_type = Column(String(50), nullable=True)  # 5xx, 4xx, Timeout, SSL Error, Connection Failed, DNS Failed
    checked_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    connected_api = relationship("ConnectedAPI", back_populates="metrics")

    __table_args__ = (
        Index("idx_metrics_api_timestamp", "connected_api_id", "checked_at"),
    )
