# skrip untuk skema project dan proposal

from pydantic import BaseModel
from datetime import datetime

# skema untuk klien mengirimkan brief
class ProjectCreate(BaseModel):
    name: str
    location: str
    event_date: str
    budget_limit: int
    description: str

# skema untuk vendor mengirimkan draft proposal
class ProposalCreate(BaseModel):
    price: int
    scope: str
    timeline: str

# skema untuk update proposal oleh vendor
class ProposalUpdate(BaseModel):
    price: int
    scope: str
    timeline: str

# skema untuk chatting
class MessageCreate(BaseModel):
    text: str

class MessageResponse(BaseModel):
    id: int
    sender_username: str
    text: str
    timestamp: datetime

    class Config:
        from_attributes = True

# skema untuk notifikasi
class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: int
    created_at: datetime