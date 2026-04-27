# erp/schema.py
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


class OFErpCreate(BaseModel):
    numero: str
    # ✅ SUPPRIMÉ: machine
    produit: str
    quantite: int
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None

    @field_validator("quantite")
    @classmethod
    def quantite_positive(cls, v):
        if v <= 0:
            raise ValueError("La quantité doit être positive")
        return v

    @field_validator("numero")
    @classmethod
    def numero_non_vide(cls, v):
        if not v.strip():
            raise ValueError("Le numéro d'OF ne peut pas être vide")
        return v.strip().upper()


class OFErpOut(BaseModel):
    id: int
    numero: str
    # ✅ SUPPRIMÉ: machine
    produit: str
    quantite: int
    date_debut: Optional[date]
    date_fin: Optional[date]
    statut_erp: str

    class Config:
        from_attributes = True