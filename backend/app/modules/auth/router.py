from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.service import login_user

from app.modules.auth.schema import UserLogin
router = APIRouter(prefix="/auth", tags=["Auth"])


# DEPRECATED: Login is now handled by the MES API at http://localhost:8000/auth/login.
# This endpoint is kept for backward compatibility only and is not called by the frontend.
@router.post("/login")
def login(credentials: dict, db: Session = Depends(get_db)):
    result = login_user(db, credentials.get("email"), credentials.get("password"))
    if not result:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    return result