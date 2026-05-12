"""Logique métier ERP : réception, archivage et consultation des rapports MES."""

from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from .model import MESReportArchive
from .schema import MESReportInbound


# ── Écriture ──────────────────────────────────────────────────────────────────

def archive_mes_report(db: Session, data: MESReportInbound) -> MESReportArchive:
    """Persiste un rapport MES reçu et retourne l'entrée créée."""
    record = MESReportArchive(
        report_type=data.report_type,
        period_label=data.period_label,
        date_from=data.date_from,
        date_to=data.date_to,
        sent_by=data.sent_by,
        payload=data.payload,
        received_at=datetime.utcnow(),
        status="archived",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── Lecture ───────────────────────────────────────────────────────────────────

def list_archived_reports(
    db: Session,
    report_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[MESReportArchive]:
    
    q = db.query(MESReportArchive)

    if report_type:
        q = q.filter(MESReportArchive.report_type == report_type)

    if date_from:
        q = q.filter(MESReportArchive.date_from >= date_from)

    if date_to:
        q = q.filter(MESReportArchive.date_from <= date_to)

    return (
        q.order_by(MESReportArchive.received_at.desc())
         .offset(offset)
         .limit(limit)
         .all()
    )


def get_archived_report(db: Session, report_id: int) -> Optional[MESReportArchive]:
    return db.query(MESReportArchive).filter(MESReportArchive.id == report_id).first()


def count_archived_reports(db: Session, report_type: Optional[str] = None) -> int:
    q = db.query(MESReportArchive)
    if report_type:
        q = q.filter(MESReportArchive.report_type == report_type)
    return q.count()


def attach_files_to_report(
    db: Session,
    report_id: int,
    pdf_path: Optional[str] = None,
    excel_path: Optional[str] = None,
) -> Optional[MESReportArchive]:
    """Met à jour les chemins des fichiers PDF/Excel d'un rapport existant."""
    record = db.query(MESReportArchive).filter(MESReportArchive.id == report_id).first()
    if not record:
        return None
    if pdf_path is not None:
        record.pdf_path = pdf_path
    if excel_path is not None:
        record.excel_path = excel_path
    db.commit()
    db.refresh(record)
    return record