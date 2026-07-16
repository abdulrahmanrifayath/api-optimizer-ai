from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class ConnectedAPICreate(BaseModel):
    name: str
    base_url: HttpUrl
    description: Optional[str] = None


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