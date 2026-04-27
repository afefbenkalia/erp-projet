from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .model import TypeMouvement, TypeArticle


# =====================
# STOCK ARTICLE
# =====================

class StockArticleCreate(BaseModel):
    code: str
    nom: str
    type_article: TypeArticle
    unite: Optional[str] = "kg"
    quantite: Optional[float] = 0.0
    quantite_min: Optional[float] = 0.0


class StockArticleUpdate(BaseModel):
    nom: Optional[str] = None
    quantite: Optional[float] = None
    quantite_min: Optional[float] = None


class StockArticleResponse(BaseModel):
    id: int
    code: str
    nom: str
    type_article: TypeArticle
    unite: str
    quantite: float
    quantite_min: float
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    en_alerte: bool = False   # calculé dans le service

    class Config:
        from_attributes = True


# =====================
# MOUVEMENT STOCK
# =====================

class MouvementStockCreate(BaseModel):
    article_id: int
    type_mouvement: TypeMouvement
    quantite: float
    source: Optional[str] = "MANUEL"
    reference: Optional[str] = None
    commentaire: Optional[str] = None


class MouvementStockResponse(BaseModel):
    id: int
    article_id: int
    article_code: str
    article_nom: str
    type_mouvement: TypeMouvement
    quantite: float
    quantite_avant: float
    quantite_apres: float
    source: Optional[str]
    reference: Optional[str]
    commentaire: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# =====================
# MISE À JOUR DEPUIS MES  (payload reçu du système MES)
# =====================

class MESProductionPayload(BaseModel):
    """
    Payload envoyé par le MES après chaque production enregistrée.
    Le MES envoie les codes articles + quantités.
    """
    production_id: int
    of_numero: str
    code_produit_fini: str          # code ERP du produit fini
    quantite_produit_fini: float    # à AJOUTER au stock
    code_matiere_premiere: str      # code ERP de la matière première
    quantite_matiere_premiere: float  # à RETIRER du stock


class MESProductionResult(BaseModel):
    success: bool
    message: str
    mouvement_produit_fini: Optional[MouvementStockResponse] = None
    mouvement_matiere_premiere: Optional[MouvementStockResponse] = None
    stock_produit_fini_apres: Optional[float] = None
    stock_matiere_premiere_apres: Optional[float] = None