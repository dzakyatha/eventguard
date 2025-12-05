# skrip untuk mengatur routing vendor

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Vendor

router = APIRouter()

# endpoint 1: untuk mendapatkan daftar vendor dengan filter opsional
@router.get("/vendors")
def get_vendors(category: Optional[str] = None, location: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Vendor)

    # filtering vendor berdasarkan kategori dan lokasi
    if category:
        query = query.filter(Vendor.category == category)
    if location:
        query = query.filter(Vendor.location == location)

    return query.all()

# endpoint 2: untuk mendapatkan detail vendor berdasarkan ID
@router.get("/vendors/{vendor_id}")
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return {"error": "Vendor not found"}
    return vendor