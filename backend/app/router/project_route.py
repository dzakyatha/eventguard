# skrip untuk mengatur routing proyek

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Message, Project, Proposal, User
from app.schemas.project import MessageResponse, ProjectCreate, ProposalUpdate, MessageCreate, ProposalCreate, ProposalResponse
from app.dependencies import get_current_user

router = APIRouter()

# endpoint 3: untuk klien membuat proyek baru kepada vendor yang dipilih
@router.post("/projects")
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can create brief projects")
    
    new_project = Project(
        client_id=current_user.id,
        vendor_id=None,
        name=data.name,
        location=data.location,
        event_date=data.event_date,
        budget_limit=data.budget_limit,
        status="BRIEF",
        description=data.description
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# endpoint 4: untuk mengirimkan draf proposal penawaran awal dari vendor ke dalam proyek
@router.post("/projects/{id}/proposals")
def send_proposal(id: int, data: ProposalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors send proposals")
    
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    proposal = Proposal(project_id=id, price=data.price, scope=data.scope, timeline=data.timeline)
    db.add(proposal)
    
    # update status proyek menjadi NEGOTIATING
    project.status = "NEGOTIATING"
    db.commit()
    db.refresh(proposal)
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
            timestamp=msg.sent_at
        ) 
        for msg in messages
    ]

# endpoint 6: untuk mengirim pesan negosiasi terkait revisi penawaran
@router.post("/projects/{id}/messages")
def send_message(id: int, data: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # cek apakah user adalah client atau vendor dari proyek ini
    if current_user.id != project.client_id and current_user.id != project.vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized for this project")
    
    # membuat pesan baru
    new_message = Message(
        project_id=id, 
        sender_id=current_user.id,
        sender=current_user.username,
        text=data.text
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message

# endpoint 7: untuk mendapatkan detail proposal tertentu berdasarkan ID
@router.get("/proposals/{proposal_id}", response_model=ProposalResponse)
def get_proposal_by_id(proposal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

# endpoint 8: untuk memperbarui isi proposal penawaran berdasarkan hasil revisi negosiasi
@router.put("/proposals/{proposal_id}")
def update_proposal(proposal_id: int, data: ProposalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    # hanya update atribut yang diubah
    if data.price is not None:
        proposal.price = data.price
    if data.scope is not None:
        proposal.scope = data.scope
    if data.timeline is not None:
        proposal.timeline = data.timeline
    
    # increment versi proposal
    proposal.version += 1
    
    db.commit()
    db.refresh(proposal)
    return proposal