from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ApiLogCreate(BaseModel):
    endpoint: str
    method: str
    status_code: int
    response_time: float
    response_size: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class ApiLogBatchCreate(BaseModel):
    logs: List[ApiLogCreate]


class ApiLogResponse(BaseModel):
    id: int
    endpoint: str
    method: str
    status_code: int
    response_time: float
    response_size: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    user_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class ApiLogPaginatedResponse(BaseModel):
    items: List[ApiLogResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class ApiLogStatsResponse(BaseModel):
    total_logs: int
    success_count: int
    error_count: int
    avg_response_time: float
    status_code_breakdown: dict