# skrip untuk mengatur routing vendor

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.database import get_db
from app.db.models import User
from app.schemas.vendor import VendorResponse
from fastapi.exceptions import HTTPException

router = APIRouter()

# endpoint 1: untuk mendapatkan daftar vendor dengan filter opsional
@router.get("/vendors", response_model=List[VendorResponse])
def get_vendors(category: Optional[str] = None, location: Optional[str] = None, db: Session = Depends(get_db)):
    # mencari user dengan role = "vendor"
    query = db.query(User).filter(User.role == "vendor")

    # filtering vendor berdasarkan kategori dan lokasi
    if category:
        query = query.filter(User.category == category)
    if location:
        query = query.filter(User.location == location)

    return query.all()

# endpoint 2: untuk mendapatkan detail vendor berdasarkan ID
@router.get("/vendors/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    # mencari user dengan role = "vendor"
    vendor = db.query(User).filter(User.user_id == vendor_id, User.role == "vendor").first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor