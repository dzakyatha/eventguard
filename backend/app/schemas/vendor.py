# skrip untuk skema vendor

from pydantic import BaseModel
from typing import Optional

class VendorResponse(BaseModel):
    id: int
    username: str
    vendor_name: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[str] = None
    description: Optional[str] = None
    
    class Config:
        from_attributes = True