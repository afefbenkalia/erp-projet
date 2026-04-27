# erp/model.py
from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class OFErp(Base):
    """Ordre de Fabrication côté ERP - source de vérité."""
    __tablename__ = "ordres_fabrication_erp"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String, unique=True, nullable=False, index=True)
    
    # ✅ SUPPRIMÉ: machine (la machine est saisie au niveau de chaque production)
    # La ligne de production est identifiée par le PRODUIT, pas par une machine unique
    
    produit = Column(String, nullable=False)   # "Ruban 100% coton", "Ruban Lin"...
    quantite = Column(Integer, nullable=False)  # quantité cible en kg
    date_debut = Column(Date, nullable=True)
    date_fin = Column(Date, nullable=True)

    # Statut côté ERP : Brouillon, Envoyé, Annulé
    statut_erp = Column(String, default="Brouillon")

    # Horodatages
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)