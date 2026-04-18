from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.router import router as auth_router
from app.modules.ordres.router import router as of_router

from app.core.database import Base, engine
from app.modules.ordres.model import OFErp  # important

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CREATE TABLES (DEV ONLY)
Base.metadata.create_all(bind=engine)

# ROUTES
app.include_router(auth_router)
app.include_router(of_router, prefix="/api")