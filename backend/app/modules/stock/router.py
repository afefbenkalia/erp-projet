from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from . import service, schema

router = APIRouter(prefix="/stock", tags=["Stock ERP"])


# =====================
# ARTICLES
# =====================

@router.get("/articles", response_model=list[schema.StockArticleResponse])
def get_articles(
    type_article: Optional[str] = Query(None, description="matiere_premiere | produit_fini"),
    db: Session = Depends(get_db)
):
    """Lister tous les articles en stock (avec filtre optionnel par type)"""
    return service.get_all_articles(db, type_article)


@router.get("/articles/{article_id}", response_model=schema.StockArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """Obtenir un article par son ID"""
    article = service.get_article_by_id(db, article_id)
    article.__dict__["en_alerte"] = article.quantite <= article.quantite_min
    return article


@router.post("/articles", response_model=schema.StockArticleResponse, status_code=201)
def create_article(data: schema.StockArticleCreate, db: Session = Depends(get_db)):
    """Créer un nouvel article dans le stock"""
    return service.create_article(db, data)


@router.put("/articles/{article_id}", response_model=schema.StockArticleResponse)
def update_article(article_id: int, data: schema.StockArticleUpdate, db: Session = Depends(get_db)):
    """Mettre à jour un article"""
    return service.update_article(db, article_id, data)


@router.delete("/articles/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    """Supprimer un article"""
    return service.delete_article(db, article_id)


# =====================
# MOUVEMENTS
# =====================

@router.get("/mouvements", response_model=list[schema.MouvementStockResponse])
def get_mouvements(
    article_id: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Historique des mouvements de stock"""
    return service.get_mouvements(db, article_id, limit)


@router.post("/mouvements", response_model=schema.MouvementStockResponse, status_code=201)
def create_mouvement(data: schema.MouvementStockCreate, db: Session = Depends(get_db)):
    """Enregistrer un mouvement de stock manuel"""
    return service.create_mouvement(db, data)


# =====================
# ENDPOINT MES → ERP
# =====================

@router.post("/mes/production", response_model=schema.MESProductionResult)
def recevoir_production_mes(
    payload: schema.MESProductionPayload,
    db: Session = Depends(get_db)
):
    """
    Endpoint appelé automatiquement par le MES après chaque production.
    Met à jour automatiquement :
    - ✅ Produit fini : AUGMENTE de quantite_produit_fini
    - ✅ Matière première : DIMINUE de quantite_matiere_premiere
    """
    return service.mise_a_jour_depuis_mes(db, payload)


# =====================
# TABLEAU DE BORD STOCK
# =====================

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """Résumé du stock pour le tableau de bord"""
    from app.modules.stock.model import StockArticle, TypeArticle

    mp = db.query(StockArticle).filter(StockArticle.type_article == TypeArticle.matiere_premiere).all()
    pf = db.query(StockArticle).filter(StockArticle.type_article == TypeArticle.produit_fini).all()

    total_mp = sum(a.quantite for a in mp)
    total_pf = sum(a.quantite for a in pf)
    alertes = [a for a in mp + pf if a.quantite <= a.quantite_min]

    return {
        "total_articles": len(mp) + len(pf),
        "nb_matieres_premieres": len(mp),
        "nb_produits_finis": len(pf),
        "total_stock_mp_kg": total_mp,
        "total_stock_pf_kg": total_pf,
        "nb_alertes_stock": len(alertes),
        "articles_en_alerte": [{"code": a.code, "nom": a.nom, "quantite": a.quantite, "quantite_min": a.quantite_min} for a in alertes]
    }