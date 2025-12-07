# skrip untuk mengatur routing MoU

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db.database import get_db
from app.db.models import Project, MoU, Invoice, User
from app.dependencies import get_current_user
from app.schemas.mou import MoUResponse, MoUStatusUpdate

router = APIRouter()

# endpoint 9: untuk membuat dokumen MoU digital (draft) berdasarkan proposal final yang disepakati
@router.post("/projects/{id}/mou")
def generate_mou(id: int, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors generate MoU")
    
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # --- LOGIKA BARU DI SINI ---
    existing_mou = db.query(MoU).filter(MoU.project_id == id).first()
    
    if existing_mou:
        # JIKA statusnya REVISION, kita izinkan generate ulang (reset status)
        if project.status == "MOU_REVISION":
            project.status = "MOU_DRAFT" # Kembalikan ke Draft agar Client bisa review lagi
            db.commit()
            db.refresh(existing_mou)
            return existing_mou
        else:
            # Jika status lain, tetap tolak duplikasi
            raise HTTPException(status_code=400, detail="MoU already exists for this project")
    # ---------------------------
    
    # Logika pembuatan baru (jika belum ada sama sekali)
    base_url = str(request.base_url).rstrip('/')
    static_url = f"{base_url}/static/templates/mou_template.pdf"
    
    new_mou = MoU(project_id=id, file_url=static_url)
    db.add(new_mou)
    project.status = "MOU_DRAFT"
    
    db.commit()
    db.refresh(new_mou)
    
    return new_mou

# endpoint 10: untuk mendapatkan detail isi dokumen MoU untuk proses review
@router.get("/mou/{mou_id}", response_model=MoUResponse)
def get_mou_by_id(mou_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mou = db.query(MoU).filter(MoU.id == mou_id).first()
    if not mou:
        raise HTTPException(status_code=404, detail="MoU not found")
    
    # memastikan hanya client atau vendor terkait yang dapat mengakses MoU
    if current_user.id != mou.project.client_id and current_user.role != "vendor": 
        raise HTTPException(status_code=403, detail="Not authorized to view this MoU")

    return MoUResponse(
        id=mou.id,
        project_id=mou.project_id,
        file_url=mou.file_url,
        created_at=datetime.now(timezone.utc),
        project_status=mou.project.status
    )

# endpoint 11: untuk memperbarui status persetujuan MoU (misal: Approved atau Request Revision) oleh pelanggan
@router.patch("/mou/{mou_id}/status")
def update_mou_status(mou_id: int, data: MoUStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # memastikan hanya client yang dapat mengubah status MoU
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can review MoU")

    # mendapatkan MoU dari proyek terkait
    mou = db.query(MoU).filter(MoU.id == mou_id).first()
    if not mou:
        raise HTTPException(status_code=404, detail="MoU not found")

    project = mou.project

    # memperbarui status proyek berdasarkan aksi client
    if data.action == "APPROVE": # mou disetujui
        project.status = "READY_TO_SIGN"
        message = "MoU Approved. Both parties can now sign"
    elif data.action == "REVISE": # meminta revisi
        project.status = "MOU_REVISION"
        message = "Revision requested. Vendor notified"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE or REVISE")

    db.commit()
    return {"status": project.status, "message": message}

# endpoint 12: untuk melakukan penandatanganan digital pada MoU yang telah diverifikasi
@router.post("/mou/{mou_id}/sign")
def sign_mou(mou_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mou = db.query(MoU).filter(MoU.id == mou_id).first()
    
    if current_user.role == "client":
        mou.client_signed_at = datetime.now(timezone.utc)
    elif current_user.role == "vendor":
        mou.vendor_signed_at = datetime.now(timezone.utc)
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # mengaktifkan proyek dan membuat invoice untuk termin 1
    if mou.client_signed_at and mou.vendor_signed_at:
        mou.project.status = "ACTIVE"
        accepted_price = mou.project.proposals[0].price if mou.project.proposals else 0
        db.add(Invoice(project_id=mou.project.id, amount=int(accepted_price * 0.5), term="TERMIN 1"))
        db.commit()
        return {"status": "fully_signed", "message": "Project Active. Invoice Sent"}

    db.commit()
    return {"status": "partially_signed", "message": "Waiting for other party"}