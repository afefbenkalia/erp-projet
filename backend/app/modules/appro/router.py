# appro/router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from . import service, schema

router = APIRouter(
    prefix="/appro",
    tags=["ERP – Approvisionnement"]
)


# ══════════════════════════════════════
# FOURNISSEURS
# ══════════════════════════════════════

@router.get("/fournisseurs", response_model=List[schema.FournisseurOut])
def list_fournisseurs(
    actif: Optional[str] = Query(None, description="Actif | Inactif"),
    db: Session = Depends(get_db)
):
    """Lister tous les fournisseurs."""
    return service.list_fournisseurs(db, actif)


@router.get("/fournisseurs/{fournisseur_id}", response_model=schema.FournisseurOut)
def get_fournisseur(fournisseur_id: int, db: Session = Depends(get_db)):
    return service.get_fournisseur(db, fournisseur_id)


@router.post("/fournisseurs", response_model=schema.FournisseurOut, status_code=201)
def create_fournisseur(data: schema.FournisseurCreate, db: Session = Depends(get_db)):
    """Créer un nouveau fournisseur."""
    return service.create_fournisseur(db, data)


@router.put("/fournisseurs/{fournisseur_id}", response_model=schema.FournisseurOut)
def update_fournisseur(
    fournisseur_id: int,
    data: schema.FournisseurUpdate,
    db: Session = Depends(get_db)
):
    return service.update_fournisseur(db, fournisseur_id, data)


@router.delete("/fournisseurs/{fournisseur_id}")
def delete_fournisseur(fournisseur_id: int, db: Session = Depends(get_db)):
    return service.delete_fournisseur(db, fournisseur_id)


# ══════════════════════════════════════
# COMMANDES ACHAT
# ══════════════════════════════════════

@router.get("/commandes", response_model=List[schema.CommandeAchatOut])
def list_commandes(
    statut: Optional[str] = Query(None),
    fournisseur_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lister les commandes achat avec filtres optionnels."""
    return service.list_commandes(db, statut, fournisseur_id)


@router.get("/commandes/{commande_id}", response_model=schema.CommandeAchatOut)
def get_commande(commande_id: int, db: Session = Depends(get_db)):
    return service.get_commande(db, commande_id)


@router.post("/commandes", response_model=schema.CommandeAchatOut, status_code=201)
def create_commande(data: schema.CommandeAchatCreate, db: Session = Depends(get_db)):
    """Créer une commande achat (Brouillon)."""
    return service.create_commande(db, data)


@router.put("/commandes/{commande_id}", response_model=schema.CommandeAchatOut)
def update_commande(
    commande_id: int,
    data: schema.CommandeAchatUpdate,
    db: Session = Depends(get_db)
):
    return service.update_commande(db, commande_id, data)


@router.post("/commandes/{commande_id}/envoyer", response_model=schema.CommandeAchatOut)
def envoyer_commande(commande_id: int, db: Session = Depends(get_db)):
    """Envoyer la commande au fournisseur (Brouillon → Envoyée)."""
    return service.envoyer_commande(db, commande_id)


@router.post("/commandes/{commande_id}/annuler", response_model=schema.CommandeAchatOut)
def annuler_commande(commande_id: int, db: Session = Depends(get_db)):
    """Annuler une commande."""
    return service.annuler_commande(db, commande_id)


@router.delete("/commandes/{commande_id}")
def delete_commande(commande_id: int, db: Session = Depends(get_db)):
    """Supprimer une commande en Brouillon."""
    return service.delete_commande(db, commande_id)


# ══════════════════════════════════════
# RÉCEPTIONS
# ══════════════════════════════════════

@router.get("/receptions", response_model=List[schema.ReceptionOut])
def list_receptions(
    commande_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lister toutes les réceptions (optionnellement filtrées par commande)."""
    return service.list_receptions(db, commande_id)


@router.post("/receptions", response_model=schema.ReceptionOut, status_code=201)
def recevoir_commande(data: schema.ReceptionCreate, db: Session = Depends(get_db)):
    """
    Enregistrer une réception de marchandise.
    Crée automatiquement un mouvement de stock ENTRÉE.
    """
    return service.recevoir_commande(db, data)


# ══════════════════════════════════════
# DASHBOARD APPRO
# ══════════════════════════════════════

@router.get("/dashboard")
def dashboard_appro(db: Session = Depends(get_db)):
    """Tableau de bord du module approvisionnement."""
    return service.get_dashboard_appro(db)