from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime


class ConnectedAPICreate(BaseModel):
    name: str
    base_url: HttpUrl
    description: Optional[str] = None


class ConnectedAPIUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[HttpUrl] = None
    description: Optional[str] = None


class ConnectedAPIStatusUpdate(BaseModel):
    status: str


class ConnectedAPIResponse(BaseModel):
    id: int
    name: str
    base_url: str
    description: Optional[str]
    status: str
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True


class TestConnectionResponse(BaseModel):
    status: str
    status_code: Optional[int] = None
    response_time: Optional[float] = None
    checked_at: str
    error: Optional[str] = None


class ConnectedApiMetricResponse(BaseModel):
    id: int
    connected_api_id: int
    status_code: Optional[int] = None
    response_time: float
    response_size: Optional[int] = None
    checked_at: datetime

    class Config:
        from_attributes = True


class ConnectedApiSummaryResponse(BaseModel):
    total_connected_apis: int
    active_apis: int
    inactive_apis: int
    average_response_time: float
    last_connection_check: Optional[datetime] = None