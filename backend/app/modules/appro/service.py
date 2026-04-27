# appro/service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date

from . import model, schema


# ══════════════════════════════════════
# FOURNISSEURS
# ══════════════════════════════════════

def list_fournisseurs(db: Session, actif: str = None):
    q = db.query(model.Fournisseur)
    if actif:
        q = q.filter(model.Fournisseur.actif == actif)
    return q.order_by(model.Fournisseur.nom).all()


def get_fournisseur(db: Session, fournisseur_id: int):
    f = db.query(model.Fournisseur).filter(model.Fournisseur.id == fournisseur_id).first()
    if not f:
        raise HTTPException(status_code=404, detail=f"Fournisseur {fournisseur_id} introuvable")
    return f


def create_fournisseur(db: Session, data: schema.FournisseurCreate):
    existing = db.query(model.Fournisseur).filter(model.Fournisseur.code == data.code).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Fournisseur avec le code '{data.code}' existe déjà")
    f = model.Fournisseur(**data.dict())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


def update_fournisseur(db: Session, fournisseur_id: int, data: schema.FournisseurUpdate):
    f = get_fournisseur(db, fournisseur_id)
    for field, value in data.dict(exclude_none=True).items():
        setattr(f, field, value)
    db.commit()
    db.refresh(f)
    return f


def delete_fournisseur(db: Session, fournisseur_id: int):
    f = get_fournisseur(db, fournisseur_id)
    # Vérifier qu'il n'a pas de commandes actives
    commandes_actives = db.query(model.CommandeAchat).filter(
        model.CommandeAchat.fournisseur_id == fournisseur_id,
        model.CommandeAchat.statut.in_([
            model.StatutCommande.brouillon,
            model.StatutCommande.envoyee,
            model.StatutCommande.recue_partielle,
        ])
    ).count()
    if commandes_actives > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de supprimer : ce fournisseur a {commandes_actives} commande(s) active(s)"
        )
    db.delete(f)
    db.commit()
    return {"message": f"Fournisseur {f.nom} supprimé"}


# ══════════════════════════════════════
# COMMANDES ACHAT
# ══════════════════════════════════════

def list_commandes(db: Session, statut: str = None, fournisseur_id: int = None):
    q = db.query(model.CommandeAchat)
    if statut:
        q = q.filter(model.CommandeAchat.statut == statut)
    if fournisseur_id:
        q = q.filter(model.CommandeAchat.fournisseur_id == fournisseur_id)
    return q.order_by(model.CommandeAchat.created_at.desc()).all()


def get_commande(db: Session, commande_id: int):
    c = db.query(model.CommandeAchat).filter(model.CommandeAchat.id == commande_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Commande {commande_id} introuvable")
    return c


def create_commande(db: Session, data: schema.CommandeAchatCreate):
    existing = db.query(model.CommandeAchat).filter(model.CommandeAchat.numero == data.numero).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Commande {data.numero} existe déjà")
    # Vérifier que le fournisseur existe
    get_fournisseur(db, data.fournisseur_id)
    c = model.CommandeAchat(**data.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def update_commande(db: Session, commande_id: int, data: schema.CommandeAchatUpdate):
    c = get_commande(db, commande_id)
    if c.statut in [model.StatutCommande.recue_totale, model.StatutCommande.annulee]:
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier une commande reçue totalement ou annulée"
        )
    for field, value in data.dict(exclude_none=True).items():
        setattr(c, field, value)
    db.commit()
    db.refresh(c)
    return c


def envoyer_commande(db: Session, commande_id: int):
    """Passe la commande en statut 'Envoyée'."""
    c = get_commande(db, commande_id)
    if c.statut != model.StatutCommande.brouillon:
        raise HTTPException(status_code=400, detail="Seules les commandes en 'Brouillon' peuvent être envoyées")
    c.statut = model.StatutCommande.envoyee
    db.commit()
    db.refresh(c)
    return c


def annuler_commande(db: Session, commande_id: int):
    c = get_commande(db, commande_id)
    if c.statut in [model.StatutCommande.recue_totale]:
        raise HTTPException(status_code=400, detail="Impossible d'annuler une commande déjà reçue totalement")
    c.statut = model.StatutCommande.annulee
    db.commit()
    db.refresh(c)
    return c


def delete_commande(db: Session, commande_id: int):
    c = get_commande(db, commande_id)
    if c.statut != model.StatutCommande.brouillon:
        raise HTTPException(status_code=400, detail="Seules les commandes en 'Brouillon' peuvent être supprimées")
    db.delete(c)
    db.commit()
    return {"message": f"Commande {c.numero} supprimée"}


# ══════════════════════════════════════
# RÉCEPTIONS  (avec mise à jour stock ERP)
# ══════════════════════════════════════

def recevoir_commande(db: Session, data: schema.ReceptionCreate):
    """
    Enregistre une réception de marchandise.
    - Met à jour quantite_recue sur la CommandeAchat
    - Met à jour le statut de la commande (partielle / totale)
    - Crée automatiquement un mouvement de stock ENTRÉE sur l'article concerné
    """
    from app.modules.stock.model import StockArticle
    from app.modules.stock.service import _enregistrer_mouvement
    from app.modules.stock.model import TypeMouvement

    c = get_commande(db, data.commande_id)

    if c.statut == model.StatutCommande.annulee:
        raise HTTPException(status_code=400, detail="Impossible de réceptionner une commande annulée")
    if c.statut == model.StatutCommande.brouillon:
        raise HTTPException(status_code=400, detail="Veuillez d'abord envoyer la commande avant de la réceptionner")

    reste = c.quantite_commandee - c.quantite_recue
    if data.quantite_recue > reste:
        raise HTTPException(
            status_code=400,
            detail=f"Quantité reçue ({data.quantite_recue}) dépasse le reste à livrer ({reste:.2f} {c.unite})"
        )

    # 1. Mettre à jour la commande
    c.quantite_recue += data.quantite_recue
    c.date_livraison_reelle = data.date_reception

    if c.quantite_recue >= c.quantite_commandee:
        c.statut = model.StatutCommande.recue_totale
    else:
        c.statut = model.StatutCommande.recue_partielle

    # 2. Créer le mouvement de stock ENTRÉE automatiquement
    article = db.query(StockArticle).filter(StockArticle.code == c.article_code).first()
    mouvement_ref = None
    if article:
        ref = f"REC-{c.numero}"
        _enregistrer_mouvement(
            db=db,
            article=article,
            type_mouvement=TypeMouvement.entree,
            quantite=data.quantite_recue,
            source="APPRO_RECEPTION",
            reference=ref,
            commentaire=data.commentaire or f"Réception commande {c.numero} — {c.fournisseur_nom}"
        )
        mouvement_ref = ref

    # 3. Enregistrer la réception
    reception = model.ReceptionCommande(
        commande_id=c.id,
        commande_numero=c.numero,
        quantite_recue=data.quantite_recue,
        date_reception=data.date_reception,
        commentaire=data.commentaire,
        mouvement_stock_ref=mouvement_ref,
    )
    db.add(reception)
    db.commit()
    db.refresh(reception)
    return reception


def list_receptions(db: Session, commande_id: int = None):
    q = db.query(model.ReceptionCommande).order_by(model.ReceptionCommande.created_at.desc())
    if commande_id:
        q = q.filter(model.ReceptionCommande.commande_id == commande_id)
    return q.all()


# ══════════════════════════════════════
# DASHBOARD APPRO
# ══════════════════════════════════════

def get_dashboard_appro(db: Session):
    from datetime import date as today_date
    today = today_date.today()

    total = db.query(model.CommandeAchat).count()
    brouillon = db.query(model.CommandeAchat).filter(
        model.CommandeAchat.statut == model.StatutCommande.brouillon).count()
    envoyees = db.query(model.CommandeAchat).filter(
        model.CommandeAchat.statut == model.StatutCommande.envoyee).count()
    recues = db.query(model.CommandeAchat).filter(
        model.CommandeAchat.statut.in_([
            model.StatutCommande.recue_partielle,
            model.StatutCommande.recue_totale
        ])).count()
    annulees = db.query(model.CommandeAchat).filter(
        model.CommandeAchat.statut == model.StatutCommande.annulee).count()

    # Commandes en retard : envoyées + date_livraison_prevue dépassée
    en_retard = db.query(model.CommandeAchat).filter(
        model.CommandeAchat.statut == model.StatutCommande.envoyee,
        model.CommandeAchat.date_livraison_prevue < today
    ).count()

    total_four = db.query(model.Fournisseur).count()
    actifs = db.query(model.Fournisseur).filter(model.Fournisseur.actif == "Actif").count()

    return {
        "total_commandes": total,
        "commandes_brouillon": brouillon,
        "commandes_envoyees": envoyees,
        "commandes_recues": recues,
        "commandes_annulees": annulees,
        "commandes_en_retard": en_retard,
        "total_fournisseurs": total_four,
        "fournisseurs_actifs": actifs,
    }