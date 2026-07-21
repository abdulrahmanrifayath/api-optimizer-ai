from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database.database import Base


class ConnectedApiMetric(Base):
    __tablename__ = "connected_api_metrics"

    id = Column(Integer, primary_key=True, index=True)
    connected_api_id = Column(
        Integer, ForeignKey("connected_apis.id", ondelete="CASCADE"), nullable=False
    )
    status_code = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=False)
    response_size = Column(Integer, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    connected_api = relationship("ConnectedAPI", back_populates="metrics")
