from pydantic import BaseModel


class ApiLogCreate(BaseModel):
    endpoint: str
    method: str
    status_code: int
    response_time: float