# skrip untuk routing notifikasi

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Notification, User
from app.dependencies import get_current_user
from app.schemas.project import NotificationResponse

router = APIRouter()

@router.get("/notifications", response_model=list[NotificationResponse])
def get_my_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()