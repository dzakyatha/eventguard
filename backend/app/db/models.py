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
    token = Column(String, nullable=True) # simple session token
    
    # atribut hanya untuk vendor (role = "vendor")
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
    name = Column(String)
    description = Column(Text)

    # atribut untuk status proyek = BRIEF
    location = Column(String)
    event_date = Column(String)
    budget_limit = Column(Integer)

    status = Column(String, default="BRIEF") # BRIEF, NEGOTIATING, MOU_DRAFT, SIGNED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # aktivasi proyek dengan escrow
    is_active = Column(Integer, default=0) # 0 = not active, 1 = active
    activated_at = Column(DateTime, nullable=True)
    escrow_account = Column(String, nullable=True) # referensi akun escrow
    payment_deadline = Column(DateTime, nullable=True) # tagihan termin pertama

    # relationships
    proposals = relationship("Proposal", back_populates="project")
    mou = relationship("MoU", back_populates="project", uselist=False)
    invoices = relationship("Invoice", back_populates="project")

# tabel proposal
class Proposal(Base):
    __tablename__ = "proposal"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"))

    # atribut untuk proposal
    scope = Column(Text)  # apa yang akan vendor sediakan
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
    file_url = Column(String)
    is_signed = Column(Integer, default=0) # 0 = No, 1 = Yes
    
    # tracking revisi dengan timestamp
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # verifikasi admin
    is_verified_by_admin = Column(Integer, default=0) # 0 = belum verifikasi, 1 = sudah verifikasi
    verified_at = Column(DateTime, nullable=True)
    
    # digital signature (step 7 workflow)
    client_signature = Column(String, nullable=True) # digital signature client
    vendor_signature = Column(String, nullable=True) # digital signature vendor
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
    term = Column(String) # "TERMIN 1 (DP 50%)"
    due_date = Column(DateTime) # deadline pembayaran
    paid_at = Column(DateTime, nullable=True) # timestamp pembayaran
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationship
    project = relationship("Project", back_populates="invoices")

# tabel pesan
class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"))
    sender_id = Column(Integer, ForeignKey("user.id"))
    sender = Column(String)  # "client" atau "vendor"
    text = Column(Text)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    sender = relationship("User")