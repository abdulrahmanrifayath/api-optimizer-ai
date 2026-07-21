from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database.database import Base


class ConnectedAPI(Base):
    __tablename__ = "connected_apis"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    base_url = Column(String(500), nullable=False)

    description = Column(String(500), nullable=True)

    status = Column(String(20), default="Active")

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))

    metrics = relationship("ConnectedApiMetric", back_populates="connected_api", cascade="all, delete-orphan")