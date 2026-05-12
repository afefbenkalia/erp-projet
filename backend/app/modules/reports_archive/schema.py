"""Schémas Pydantic pour réception et réponse des rapports MES."""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class MESReportInbound(BaseModel):
    """Payload envoyé par le MES vers l'ERP."""
    report_type:  str          = Field(..., description="daily|weekly|production-of|maintenance|performance|traceability")
    period_label: str          = Field(..., description="Libellé lisible de la période")
    date_from:    Optional[str] = Field(None, description="YYYY-MM-DD")
    date_to:      Optional[str] = Field(None, description="YYYY-MM-DD")
    sent_by:      Optional[str] = Field(None, description="Identifiant de l'instance MES")
    payload:      dict[str, Any] = Field(..., description="Données complètes du rapport MES")
    pdf_base64:   Optional[str] = Field(None, description="Fichier PDF encodé en base64")
    excel_base64: Optional[str] = Field(None, description="Fichier Excel encodé en base64")


class MESReportResponse(BaseModel):
    """Réponse retournée au MES après archivage."""
    id:           int
    report_type:  str
    period_label: str
    received_at:  datetime
    status:       str
    pdf_path:     Optional[str] = None
    excel_path:   Optional[str] = None

    class Config:
        from_attributes = True


class MESReportSummary(BaseModel):
    """Résumé pour listing."""
    id:           int
    report_type:  str
    period_label: str
    date_from:    Optional[str]
    date_to:      Optional[str]
    received_at:  datetime
    status:       str

    class Config:
        from_attributes = True