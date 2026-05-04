from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.router import router as auth_router
from app.modules.ordres.router import router as of_router
from app.modules.stock.router import router as stock_router
from app.modules.appro.router import router as appro_router
from app.modules.reports_archive.router import router as report_router

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
app.include_router(stock_router, prefix="/api")
app.include_router(appro_router, prefix="/api")
app.include_router(report_router, prefix="/api")