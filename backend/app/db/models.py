# skrip untuk mendefinisikan tabel database

from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

# tabel pengguna: client, vendor, dan admin
class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # "client", "vendor", atau "admin"
    token = Column(String, nullable=True)
    
    # atribut tambahan untuk vendor
    vendor_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    location = Column(String, nullable=True)
    rating = Column(String, nullable=True)
    description = Column(Text, nullable=True)


# tabel proyek
class Project(Base):
    __tablename__ = "project"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("user.id"))
    vendor_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    # atribut untuk proyek
    name = Column(String)
    location = Column(String)
    event_date = Column(String)
    budget_limit = Column(Integer)
    description = Column(Text, nullable=True)

    status = Column(String, default="BRIEF") # BRIEF, NEGOTIATING, MOU_DRAFT, MOU_REVISION, READY_TO_SIGN, ACTIVE, COMPLETED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    proposals = relationship("Proposal", back_populates="project")
    mou = relationship("MoU", back_populates="project", uselist=False)
    messages = relationship("Message", back_populates="project")
    invoices = relationship("Invoice", back_populates="project")


# tabel proposal
class Proposal(Base):
    __tablename__ = "proposal"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"))

    # atribut untuk proposal
    scope = Column(Text) # apa yang akan vendor sediakan
    timeline = Column(String)
    price = Column(Integer)

    status = Column(String, default="DRAFT") # DRAFT, SUBMITTED, ACCEPTED, REJECTED
    
    # tracking revisi dengan timestamp
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # relationship
    project = relationship("Project", back_populates="proposals")


# tabel MoU
class MoU(Base):
    __tablename__ = "mou"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"))

    # atribut untuk MoU
    file_url = Column(String)
    is_signed = Column(Integer, default=0)
    
    # tracking revisi dengan timestamp
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # atribut untuk verifikasi admin
    is_verified_by_admin = Column(Integer, default=0)
    verified_at = Column(DateTime, nullable=True)

    # atribut untuk tanda tangan digital
    client_signature = Column(String, nullable=True)
    vendor_signature = Column(String, nullable=True)
    client_signed_at = Column(DateTime, nullable=True)
    vendor_signed_at = Column(DateTime, nullable=True)
    
    # relationship
    project = relationship("Project", back_populates="mou")


# table invoice
class Invoice(Base):
    __tablename__ = "invoice"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"))
    amount = Column(Integer)
    status = Column(String, default="UNPAID") # UNPAID, PAID, OVERDUE
    term = Column(String) # "TERMIN 1 (DP 50%)", "TERMIN 2 (PELUNASAN 50%)"
    due_date = Column(DateTime)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # relationship
    project = relationship("Project", back_populates="invoices")


# tabel pesan
class Message(Base):
    __tablename__ = "message"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"))
    sender_id = Column(Integer, ForeignKey("user.id"))
    text = Column(Text)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # relationships
    project = relationship("Project", back_populates="messages")
    user = relationship("User")