from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from backend.database.database import Base


class ApiLog(Base):

    __tablename__ = "api_logs"

    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String(255))
    method = Column(String(10))
    status_code = Column(Integer)
    response_time = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)