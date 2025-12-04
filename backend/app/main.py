from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from app.db.database import get_db, engine, Base

# lifespan event utk membuat tabel saat startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: membuat tabel database
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    yield
    # Shutdown
    print("Application shutting down")

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

# testing koneksi database
@app.get("/test-db")
def test_database(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "success", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def main():
    print("Hello from backend!")

if __name__ == "__main__":
    main()
