from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class TypeMouvement(str, enum.Enum):
    entree = "entree"
    sortie = "sortie"
    ajustement = "ajustement"


class TypeArticle(str, enum.Enum):
    matiere_premiere = "matiere_premiere"
    produit_fini = "produit_fini"


class StockArticle(Base):
    """Table principale des articles en stock ERP"""
    __tablename__ = "stock_articles"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    nom = Column(String, nullable=False)
    type_article = Column(Enum(TypeArticle), nullable=False)
    unite = Column(String, default="kg")
    quantite = Column(Float, default=0.0)
    quantite_min = Column(Float, default=0.0)   # seuil alerte
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class MouvementStock(Base):
    """Historique de tous les mouvements de stock"""
    __tablename__ = "mouvements_stock"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, nullable=False)
    article_code = Column(String, nullable=False)
    article_nom = Column(String, nullable=False)
    type_mouvement = Column(Enum(TypeMouvement), nullable=False)
    quantite = Column(Float, nullable=False)
    quantite_avant = Column(Float, nullable=False)
    quantite_apres = Column(Float, nullable=False)
    source = Column(String)          # "MES_PRODUCTION", "MANUEL", etc.
    reference = Column(String)       # N° OF, N° production, etc.
    commentaire = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())