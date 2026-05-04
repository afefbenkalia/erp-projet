"""
ERP — Routes pour réception (MES → ERP) et consultation des rapports archivés.

  POST /api/erp/reports/receive     ← appelé par le MES (clé dans Header)
  GET  /api/erp/reports/stats       ← managers / admins ERP
  GET  /api/erp/reports/            ← listing avec filtres
  GET  /api/erp/reports/{id}        ← détail complet
"""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.database import get_db

from .schema import MESReportInbound, MESReportResponse, MESReportSummary
from .service import (
    archive_mes_report,
    count_archived_reports,
    get_archived_report,
    list_archived_reports,
)

router = APIRouter(prefix="/erp/reports", tags=["ERP – Rapports MES"])

VALID_TYPES = {
    "daily", "weekly", "production-of",
    "maintenance", "performance", "traceability",
}

# Clé partagée MES → ERP (à externaliser en variable d'env en production)
MES_API_KEY = "MES_SECRET_KEY_CHANGE_ME"


# ── Auth MES : clé dans le Header HTTP ────────────────────────────────────────
def _verify_mes_key(x_mes_api_key: str = Header(...)):
    """Vérifie la clé API envoyée par le MES dans le header x-mes-api-key."""
    if x_mes_api_key != MES_API_KEY:
        raise HTTPException(status_code=401, detail="Clé API MES invalide")


# ── Auth ERP : token JWT classique, admin OU manager ─────────────────────────
def _require_manager(current_user: dict = Depends(get_current_user)) -> dict:
    """Accepte les rôles admin et manager (tous les users ERP sont admin)."""
    if current_user.get("role") not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    return current_user


# ── Réception depuis le MES ───────────────────────────────────────────────────

@router.post("/receive", response_model=MESReportResponse, status_code=201)
def receive_mes_report(
    data: MESReportInbound,
    db: Session = Depends(get_db),
    _: None = Depends(_verify_mes_key),
):
    """
    Reçoit un rapport calculé par le MES et l'archive dans l'ERP.
    Authentification : header x-mes-api-key (pas de JWT nécessaire).
    """
    if data.report_type not in VALID_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Type invalide. Valeurs acceptées : {sorted(VALID_TYPES)}",
        )
    return archive_mes_report(db, data)


# ── Statistiques ──────────────────────────────────────────────────────────────

@router.get("/stats")
def report_stats(
    db: Session = Depends(get_db),
    _: dict = Depends(_require_manager),
):
    """Nombre de rapports archivés par type."""
    return {rtype: count_archived_reports(db, rtype) for rtype in VALID_TYPES}


# ── Listing ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[MESReportSummary])
def list_reports(
    report_type: Optional[str] = Query(None),
    date_from:   Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    date_to:     Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    limit:  int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: dict = Depends(_require_manager),
):
    """Liste les rapports MES archivés avec filtres optionnels."""
    if report_type and report_type not in VALID_TYPES:
        raise HTTPException(status_code=422, detail="Type invalide")
    return list_archived_reports(db, report_type, date_from, date_to, limit, offset)


# ── Détail ────────────────────────────────────────────────────────────────────

@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_manager),
):
    """Retourne le rapport complet (payload JSON inclus)."""
    record = get_archived_report(db, report_id)
    if not record:
        raise HTTPException(status_code=404, detail="Rapport introuvable")
    return {
        "id":           record.id,
        "report_type":  record.report_type,
        "period_label": record.period_label,
        "date_from":    record.date_from,
        "date_to":      record.date_to,
        "received_at":  record.received_at.isoformat(),
        "sent_by":      record.sent_by,
        "status":       record.status,
        "payload":      record.payload,
    }