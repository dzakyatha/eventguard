# skrip untuk mengatur routing proyek

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Message, Notification, Project, Proposal, User
from app.schemas.project import MessageResponse, ProjectCreate, ProposalUpdate, MessageCreate, ProposalCreate
from app.dependencies import get_current_user
from datetime import datetime

router = APIRouter()

# endpoint 3: untuk klien membuat proyek baru kepada vendor yang dipilih
@router.post("/projects")
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients send briefs")
    new_project = Project(
        client_id=current_user.id, vendor_id=data.vendor_id, name=data.name,
        location=data.location, event_date=data.event_date, budget_limit=data.budget_limit,
        status="REQUESTED"
    )
    db.add(new_project)
    db.commit()
    return new_project

# endpoint 4: untuk mengirimkan draf proposal penawaran awal dari vendor ke dalam proyek
@router.post("/projects/{id}/proposals")
def send_proposal(id: int, data: ProposalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors send proposals")
    proposal = Proposal(project_id=id, price=data.price, scope=data.scope, timeline=data.timeline)
    db.add(proposal)
    project = db.query(Project).filter(Project.id == id).first()
    project.status = "NEGOTIATING"
    db.commit()
    return proposal

# endpoint 5: untuk mendapatkan riwayat pesan negosiasi antara client dan vendor
@router.get("/projects/{id}/messages", response_model=list[MessageResponse])
def get_messages(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    messages = db.query(Message).filter(Message.project_id == id).all()
    
    return [
        MessageResponse(
            id=msg.id, 
            sender_username=msg.sender.username, 
            text=msg.text, 
            timestamp=msg.created_at
        ) 
        for msg in messages
    ]

# endpoint 6: untuk mengirimkan pesan negosiasi terkait revisi penawaran
@router.post("/projects/{id}/messages")
def send_message(id: int, data: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_msg = Message(
        project_id=id,
        sender_id=current_user.id,
        text=data.text
    )
    db.add(new_msg)

    recipient_user_id = None        
    if current_user.id == project.client_id:
        recipient_user_id = 2 # id dummy
    else:
        recipient_user_id = project.client_id

    if recipient_user_id:
        notif = Notification(
            user_id=recipient_user_id,
            message=f"New message in {project.name}: {data.text[:20]}..."
        )
        db.add(notif)

    db.commit()
    return {"status": "sent"}

# endpoint 7: untuk memperbarui isi proposal penawaran berdasarkan hasil revisi negosiasi
@router.put("/proposals/{proposal_id}")
def update_proposal(proposal_id: int, data: ProposalUpdate, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal.price = data.price
    proposal.description = data.description
    db.commit()
    return proposal