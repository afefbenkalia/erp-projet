from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text

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
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Renvoie les erreurs 500 en JSON avec les en-têtes CORS inclus
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erreur interne : {str(exc)}"},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")},
    )

# CREATE TABLES (DEV ONLY)
Base.metadata.create_all(bind=engine)

# Migration auto : ajoute les colonnes manquantes sans toucher aux données
def _add_missing_columns():
    try:
        inspector = inspect(engine)
        if "mes_report_archives" not in inspector.get_table_names():
            return
        existing = {col["name"] for col in inspector.get_columns("mes_report_archives")}
        with engine.begin() as conn:
            if "pdf_path" not in existing:
                conn.execute(text("ALTER TABLE mes_report_archives ADD COLUMN pdf_path VARCHAR(500)"))
            if "excel_path" not in existing:
                conn.execute(text("ALTER TABLE mes_report_archives ADD COLUMN excel_path VARCHAR(500)"))
    except Exception as e:
        print(f"[migration] avertissement colonnes : {e}")

_add_missing_columns()

# ROUTES
app.include_router(auth_router)
app.include_router(of_router, prefix="/api")
app.include_router(stock_router, prefix="/api")
app.include_router(appro_router, prefix="/api")
app.include_router(report_router, prefix="/api")