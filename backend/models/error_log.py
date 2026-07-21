from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database.database import Base


class ErrorLog(Base):
    __tablename__ = "error_logs"

    id = Column(Integer, primary_key=True, index=True)
    connected_api_id = Column(
        Integer, ForeignKey("connected_apis.id", ondelete="CASCADE"), nullable=False, index=True
    )
    error_type = Column(String(50), nullable=False)  # 5xx, 4xx, Timeout, SSL Error, Connection Failed, DNS Failed
    status_code = Column(Integer, nullable=True)
    message = Column(String(500), nullable=True)
    frequency = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    connected_api = relationship("ConnectedAPI", back_populates="error_logs")
