# erp/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from .model import OFErp
from .schema import OFErpCreate, OFErpOut
from typing import List
from datetime import datetime
import httpx


router = APIRouter(
    prefix="/erp/ordres-fabrication",
    tags=["ERP – Ordres Fabrication"]
)

MES_BASE_URL = "http://127.0.0.1:8000/api/ordres-fabrication"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[OFErpOut])
def list_ofs(db: Session = Depends(get_db)):
    return db.query(OFErp).order_by(OFErp.created_at.desc()).all()


@router.post("/", response_model=OFErpOut, status_code=201)
def create_of(of_data: OFErpCreate, db: Session = Depends(get_db)):
    existing = db.query(OFErp).filter(OFErp.numero == of_data.numero).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"OF {of_data.numero} déjà existant dans l'ERP"
        )

    new_of = OFErp(
        numero=of_data.numero,
        # ✅ SUPPRIMÉ: machine
        produit=of_data.produit,
        quantite=of_data.quantite,
        date_debut=of_data.date_debut,
        date_fin=of_data.date_fin,
        statut_erp="Brouillon"
    )

    db.add(new_of)
    db.commit()
    db.refresh(new_of)
    return new_of


@router.put("/{of_id}", response_model=OFErpOut)
def update_of(of_id: int, of_data: OFErpCreate, db: Session = Depends(get_db)):
    of = db.query(OFErp).filter(OFErp.id == of_id).first()
    if not of:
        raise HTTPException(status_code=404, detail="OF non trouvé")
    if of.statut_erp == "Envoyé":
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier un OF déjà envoyé au MES"
        )

    # ✅ SUPPRIMÉ: of.machine = ...
    of.produit = of_data.produit
    of.quantite = of_data.quantite
    of.date_debut = of_data.date_debut
    of.date_fin = of_data.date_fin

    db.commit()
    db.refresh(of)
    return of


@router.delete("/{of_id}")
def delete_of(of_id: int, db: Session = Depends(get_db)):
    of = db.query(OFErp).filter(OFErp.id == of_id).first()
    if not of:
        raise HTTPException(status_code=404, detail="OF non trouvé")
    if of.statut_erp == "Envoyé":
        raise HTTPException(
            status_code=400,
            detail="Impossible de supprimer un OF déjà envoyé"
        )
    db.delete(of)
    db.commit()
    return {"message": f"OF {of.numero} supprimé"}


@router.post("/{of_id}/envoyer-mes")
async def envoyer_vers_mes(of_id: int, db: Session = Depends(get_db)):
    of = db.query(OFErp).filter(OFErp.id == of_id).first()
    if not of:
        raise HTTPException(status_code=404, detail="OF non trouvé")
    if of.statut_erp == "Envoyé":
        raise HTTPException(status_code=400, detail="Cet OF a déjà été envoyé au MES")

    payload = {
        "numero": of.numero,
        # ✅ SUPPRIMÉ: "machine": of.machine,
        "produit": of.produit,
        "quantite": of.quantite,
        "date_debut": str(of.date_debut) if of.date_debut else None,
        "date_fin": str(of.date_fin) if of.date_fin else None,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(MES_BASE_URL + "/", json=payload)

        if response.status_code == 201:
            of.statut_erp = "Envoyé"
            of.sent_at = datetime.utcnow()
            db.commit()
            return {
                "success": True,
                "message": f"OF {of.numero} envoyé avec succès au MES",
                "mes_response": response.json()
            }
        elif response.status_code == 409:
            of.statut_erp = "Envoyé"
            db.commit()
            return {"success": True, "message": f"OF {of.numero} déjà présent dans le MES (synchronisé)"}
        else:
            raise HTTPException(status_code=502, detail=f"Erreur MES ({response.status_code}): {response.text}")

    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Impossible de joindre le système MES.")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Le système MES n'a pas répondu dans les délais.")


@router.post("/envoyer-tous-mes")
async def envoyer_tous_vers_mes(db: Session = Depends(get_db)):
    ofs_brouillon = db.query(OFErp).filter(OFErp.statut_erp == "Brouillon").all()
    if not ofs_brouillon:
        return {"message": "Aucun OF en attente d'envoi", "envoyes": 0, "erreurs": 0}

    envoyes = 0
    erreurs = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        for of in ofs_brouillon:
            payload = {
                "numero": of.numero,
                # ✅ SUPPRIMÉ: "machine": of.machine,
                "produit": of.produit,
                "quantite": of.quantite,
                "date_debut": str(of.date_debut) if of.date_debut else None,
                "date_fin": str(of.date_fin) if of.date_fin else None,
            }
            try:
                response = await client.post(MES_BASE_URL + "/", json=payload)
                if response.status_code in (201, 409):
                    of.statut_erp = "Envoyé"
                    of.sent_at = datetime.utcnow()
                    envoyes += 1
                else:
                    erreurs.append(f"OF {of.numero}: erreur {response.status_code}")
            except Exception as e:
                erreurs.append(f"OF {of.numero}: {str(e)}")

    db.commit()
    return {"envoyes": envoyes, "erreurs": len(erreurs), "details_erreurs": erreurs}