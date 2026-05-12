"""Modèle SQLAlchemy pour l'archivage des rapports reçus du MES."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.core.database import Base


class MESReportArchive(Base):
    __tablename__ = "mes_report_archives"

    id           = Column(Integer, primary_key=True, index=True)
    report_type  = Column(String(50), nullable=False, index=True)
    # "daily" | "weekly" | "production-of" | "maintenance" | "performance" | "traceability"

    period_label = Column(String(100), nullable=False)
    # ex: "2026-04-29" ou "2026-W17" ou "2026-04-01/2026-04-29"

    date_from    = Column(String(10), nullable=True)   # YYYY-MM-DD
    date_to      = Column(String(10), nullable=True)   # YYYY-MM-DD
    received_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    sent_by      = Column(String(100), nullable=True)  # identifiant MES
    payload      = Column(JSON, nullable=False)        # données brutes du rapport
    status       = Column(String(20), default="archived", nullable=False)
    # "archived" | "processed" | "error"
    pdf_path     = Column(String(500), nullable=True)  # chemin fichier PDF joint par le MES
    excel_path   = Column(String(500), nullable=True)  # chemin fichier Excel joint par le MES

    def __repr__(self):
        return f"<MESReportArchive id={self.id} type={self.report_type} period={self.period_label}>"