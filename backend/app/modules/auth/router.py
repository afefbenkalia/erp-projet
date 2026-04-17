from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.service import login_user

from app.modules.auth.schema import UserLogin
router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(credentials: dict, db: Session = Depends(get_db)):
    print("=== ENDPOINT LOGIN ===")
    print(f"Email reçu: {credentials.get('email')}")
    print(f"Password reçu: {credentials.get('password')}")
    
    result = login_user(db, credentials.get('email'), credentials.get('password'))
    
    if not result:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    return result