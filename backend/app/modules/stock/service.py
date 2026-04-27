from sqlalchemy.orm import Session
from fastapi import HTTPException

from . import model, schema


# =====================
# ARTICLES
# =====================

def get_all_articles(db: Session, type_article: str = None):
    query = db.query(model.StockArticle)
    if type_article:
        query = query.filter(model.StockArticle.type_article == type_article)
    articles = query.all()
    # Ajouter le flag en_alerte
    result = []
    for a in articles:
        a_dict = a.__dict__.copy()
        a_dict["en_alerte"] = a.quantite <= a.quantite_min
        result.append(a_dict)
    return result


def get_article_by_id(db: Session, article_id: int):
    article = db.query(model.StockArticle).filter(model.StockArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail=f"Article {article_id} introuvable")
    return article


def get_article_by_code(db: Session, code: str):
    article = db.query(model.StockArticle).filter(model.StockArticle.code == code).first()
    if not article:
        raise HTTPException(status_code=404, detail=f"Article avec code '{code}' introuvable")
    return article


def create_article(db: Session, data: schema.StockArticleCreate):
    # Vérifier unicité du code
    existing = db.query(model.StockArticle).filter(model.StockArticle.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Un article avec le code '{data.code}' existe déjà")

    article = model.StockArticle(**data.dict())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(db: Session, article_id: int, data: schema.StockArticleUpdate):
    article = get_article_by_id(db, article_id)
    for field, value in data.dict(exclude_none=True).items():
        setattr(article, field, value)
    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article_id: int):
    article = get_article_by_id(db, article_id)
    db.delete(article)
    db.commit()
    return {"message": "Article supprimé"}


# =====================
# MOUVEMENTS
# =====================

def _enregistrer_mouvement(
    db: Session,
    article: model.StockArticle,
    type_mouvement: model.TypeMouvement,
    quantite: float,
    source: str = "MANUEL",
    reference: str = None,
    commentaire: str = None
) -> model.MouvementStock:
    """Fonction interne : enregistre un mouvement et met à jour la quantité."""
    quantite_avant = article.quantite

    if type_mouvement == model.TypeMouvement.entree:
        article.quantite += quantite
    elif type_mouvement == model.TypeMouvement.sortie:
        if article.quantite < quantite:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour '{article.nom}'. Disponible: {article.quantite} kg, Demandé: {quantite} kg"
            )
        article.quantite -= quantite
    elif type_mouvement == model.TypeMouvement.ajustement:
        article.quantite = quantite   # remplacement direct

    mouvement = model.MouvementStock(
        article_id=article.id,
        article_code=article.code,
        article_nom=article.nom,
        type_mouvement=type_mouvement,
        quantite=quantite,
        quantite_avant=quantite_avant,
        quantite_apres=article.quantite,
        source=source,
        reference=reference,
        commentaire=commentaire
    )

    db.add(mouvement)
    db.commit()
    db.refresh(mouvement)
    return mouvement


def create_mouvement(db: Session, data: schema.MouvementStockCreate):
    article = get_article_by_id(db, data.article_id)
    return _enregistrer_mouvement(
        db, article,
        data.type_mouvement,
        data.quantite,
        data.source,
        data.reference,
        data.commentaire
    )


def get_mouvements(db: Session, article_id: int = None, limit: int = 100):
    query = db.query(model.MouvementStock).order_by(model.MouvementStock.id.desc())
    if article_id:
        query = query.filter(model.MouvementStock.article_id == article_id)
    return query.limit(limit).all()


# =====================
# INTÉGRATION MES → ERP
# =====================

def mise_a_jour_depuis_mes(db: Session, payload: schema.MESProductionPayload) -> schema.MESProductionResult:
    """
    Point d'entrée appelé par le MES après chaque production.
    - Augmente le stock du produit fini
    - Diminue le stock de la matière première
    """
    try:
        # 1. Récupérer les articles par code
        produit_fini = get_article_by_code(db, payload.code_produit_fini)
        matiere_premiere = get_article_by_code(db, payload.code_matiere_premiere)

        reference = f"OF-{payload.of_numero}-PROD-{payload.production_id}"

        # 2. ENTRÉE : augmenter le produit fini
        mouv_pf = _enregistrer_mouvement(
            db=db,
            article=produit_fini,
            type_mouvement=model.TypeMouvement.entree,
            quantite=payload.quantite_produit_fini,
            source="MES_PRODUCTION",
            reference=reference,
            commentaire=f"Production MES - OF {payload.of_numero}"
        )

        # 3. SORTIE : diminuer la matière première
        mouv_mp = _enregistrer_mouvement(
            db=db,
            article=matiere_premiere,
            type_mouvement=model.TypeMouvement.sortie,
            quantite=payload.quantite_matiere_premiere,
            source="MES_PRODUCTION",
            reference=reference,
            commentaire=f"Consommation MP - OF {payload.of_numero}"
        )

        return schema.MESProductionResult(
            success=True,
            message=f"Stock mis à jour avec succès pour la production {payload.production_id}",
            mouvement_produit_fini=mouv_pf,
            mouvement_matiere_premiere=mouv_mp,
            stock_produit_fini_apres=produit_fini.quantite,
            stock_matiere_premiere_apres=matiere_premiere.quantite
        )

    except HTTPException as e:
        return schema.MESProductionResult(
            success=False,
            message=f"Erreur: {e.detail}"
        )
    except Exception as e:
        return schema.MESProductionResult(
            success=False,
            message=f"Erreur inattendue: {str(e)}"
        )