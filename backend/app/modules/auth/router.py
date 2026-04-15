from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.service import login_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    user = login_user(db, data["email"], data["password"])

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": user["token"],
        "role": user["role"]
    }