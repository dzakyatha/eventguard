from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.database import SessionLocal, engine
from app.db import models
from app.router import auth_route, project_route, mou_route, vendor_route

models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()

    # dummy data untuk client
    if not db.query(models.User).filter_by(username="rina_eo").first():
        db.add(models.User(username="rina_eo", password="password123", role="client"))
    
    # dummy data untuk vendor
    if not db.query(models.User).filter_by(username="sound_bandung").first():
        db.add(models.User(
        username="sound_bandung", 
        password="password123", 
        role="vendor",
        # profile data
        vendor_name="Sound System Bandung",
        category="Sound System",
        location="Bandung",
        rating="4.8",
        description="Menyediakan layanan sound system berkualitas untuk berbagai acara",
    ))
    
    db.commit()
    db.close()
    yield

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://eventguard-sage.vercel.app",
    "https://eventguard-production.up.railway.app"
]

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_route.router)
app.include_router(vendor_route.router)
app.include_router(project_route.router)
app.include_router(mou_route.router)