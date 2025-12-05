# skrip untuk skema project dan proposal

from pydantic import BaseModel

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

# skema untuk chat message
class ChatMessage(BaseModel):
    sender: str
    text: str
    timestamp: str