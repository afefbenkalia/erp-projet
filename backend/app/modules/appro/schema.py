# appro/schema.py
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from .model import StatutCommande


# ─────────────────────────────────────
# FOURNISSEUR
# ─────────────────────────────────────

class FournisseurCreate(BaseModel):
    code: str
    nom: str
    contact: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    adresse: Optional[str] = None
    article_code: Optional[str] = None
    article_nom: Optional[str] = None
    delai_livraison_jours: Optional[int] = 7
    actif: Optional[str] = "Actif"

    @field_validator("code")
    @classmethod
    def code_upper(cls, v):
        return v.strip().upper()

    @field_validator("nom")
    @classmethod
    def nom_non_vide(cls, v):
        if not v.strip():
            raise ValueError("Le nom du fournisseur ne peut pas être vide")
        return v.strip()


class FournisseurUpdate(BaseModel):
    nom: Optional[str] = None
    contact: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    adresse: Optional[str] = None
    article_code: Optional[str] = None
    article_nom: Optional[str] = None
    delai_livraison_jours: Optional[int] = None
    actif: Optional[str] = None


class FournisseurOut(BaseModel):
    id: int
    code: str
    nom: str
    contact: Optional[str]
    telephone: Optional[str]
    email: Optional[str]
    adresse: Optional[str]
    article_code: Optional[str]
    article_nom: Optional[str]
    delai_livraison_jours: int
    actif: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────────────────────────
# COMMANDE ACHAT
# ─────────────────────────────────────

class CommandeAchatCreate(BaseModel):
    numero: str
    fournisseur_id: int
    fournisseur_nom: str
    date_commande: Optional[date] = None
    date_livraison_prevue: Optional[date] = None
    article_code: str
    article_nom: str
    quantite_commandee: float
    unite: Optional[str] = "kg"
    prix_unitaire: Optional[float] = None
    commentaire: Optional[str] = None

    @field_validator("quantite_commandee")
    @classmethod
    def qte_positive(cls, v):
        if v <= 0:
            raise ValueError("La quantité doit être positive")
        return v


class CommandeAchatUpdate(BaseModel):
    date_commande: Optional[date] = None
    date_livraison_prevue: Optional[date] = None
    quantite_commandee: Optional[float] = None
    prix_unitaire: Optional[float] = None
    commentaire: Optional[str] = None
    statut: Optional[StatutCommande] = None


class CommandeAchatOut(BaseModel):
    id: int
    numero: str
    fournisseur_id: int
    fournisseur_nom: str
    statut: StatutCommande
    date_commande: Optional[date]
    date_livraison_prevue: Optional[date]
    date_livraison_reelle: Optional[date]
    article_code: str
    article_nom: str
    quantite_commandee: float
    quantite_recue: float
    unite: str
    prix_unitaire: Optional[float]
    commentaire: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────────────────────────
# RÉCEPTION
# ─────────────────────────────────────

class ReceptionCreate(BaseModel):
    commande_id: int
    quantite_recue: float
    date_reception: date
    commentaire: Optional[str] = None

    @field_validator("quantite_recue")
    @classmethod
    def qte_positive(cls, v):
        if v <= 0:
            raise ValueError("La quantité reçue doit être positive")
        return v


class ReceptionOut(BaseModel):
    id: int
    commande_id: int
    commande_numero: str
    quantite_recue: float
    date_reception: date
    commentaire: Optional[str]
    mouvement_stock_ref: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────────────────────────
# DASHBOARD APPRO
# ─────────────────────────────────────

class DashboardApproOut(BaseModel):
    total_commandes: int
    commandes_brouillon: int
    commandes_envoyees: int
    commandes_recues: int
    commandes_annulees: int
    commandes_en_retard: int
    total_fournisseurs: int
    fournisseurs_actifs: int