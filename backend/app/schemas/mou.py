# skrip untuk skema MoU

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MoUResponse(BaseModel):
    id: int
    project_id: int
    file_url: str
    created_at: datetime
    project_status: str # "MOU_REVIEW" or "MOU_REVISION"

    class Config:
        from_attributes = True

class MoUStatusUpdate(BaseModel):
    action: str # "APPROVE" or "REVISE"
    feedback: Optional[str] = None