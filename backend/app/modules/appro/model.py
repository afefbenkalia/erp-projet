# appro/model.py
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class StatutCommande(str, enum.Enum):
    brouillon = "Brouillon"
    envoyee = "Envoyée"
    recue_partielle = "Reçue partielle"
    recue_totale = "Reçue totale"
    annulee = "Annulée"


class StatutLigne(str, enum.Enum):
    en_attente = "En attente"
    recue_partielle = "Reçue partielle"
    recue_totale = "Reçue totale"


class Fournisseur(Base):
    """Table des fournisseurs de matières premières."""
    __tablename__ = "fournisseurs"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)  # ex: FOUR-001
    nom = Column(String, nullable=False)
    contact = Column(String, nullable=True)
    telephone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    adresse = Column(Text, nullable=True)
    # Article principal fourni (lié logiquement au stock)
    article_code = Column(String, nullable=True)   # code article ERP correspondant
    article_nom = Column(String, nullable=True)
    delai_livraison_jours = Column(Integer, default=7)
    actif = Column(String, default="Actif")          # Actif / Inactif
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CommandeAchat(Base):
    """Bon de commande fournisseur (matières premières)."""
    __tablename__ = "commandes_achat"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String, unique=True, nullable=False, index=True)  # CA-YYMMDD-XXX
    fournisseur_id = Column(Integer, ForeignKey("fournisseurs.id"), nullable=False)
    fournisseur_nom = Column(String, nullable=False)    # dénormalisation pour affichage rapide

    statut = Column(Enum(StatutCommande), default=StatutCommande.brouillon)
    date_commande = Column(Date, nullable=True)
    date_livraison_prevue = Column(Date, nullable=True)
    date_livraison_reelle = Column(Date, nullable=True)

    # Article commandé
    article_code = Column(String, nullable=False)
    article_nom = Column(String, nullable=False)
    quantite_commandee = Column(Float, nullable=False)
    quantite_recue = Column(Float, default=0.0)
    unite = Column(String, default="kg")
    prix_unitaire = Column(Float, nullable=True)

    commentaire = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ReceptionCommande(Base):
    """Réception (partielle ou totale) d'une commande achat."""
    __tablename__ = "receptions_commande"

    id = Column(Integer, primary_key=True, index=True)
    commande_id = Column(Integer, ForeignKey("commandes_achat.id"), nullable=False)
    commande_numero = Column(String, nullable=False)
    quantite_recue = Column(Float, nullable=False)
    date_reception = Column(Date, nullable=False)
    commentaire = Column(Text, nullable=True)
    # Référence du mouvement stock créé automatiquement
    mouvement_stock_ref = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())