import os
from pathlib import Path
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

# Chemin absolu vers backend/.env — fiable quel que soit le répertoire de lancement
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_ENV_FILE)

# Doit être identique à la SECRET_KEY du MES (les tokens sont émis par le MES)
SECRET_KEY = os.getenv("SECRET_KEY", "erp_secret_key")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

print(f"[ERP security] SECRET_KEY chargée depuis : {_ENV_FILE}")
print(f"[ERP security] SECRET_KEY = {SECRET_KEY!r}")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if "ERP" not in payload.get("apps", []):
        raise HTTPException(status_code=403, detail="Token not authorized for ERP")
    return payload


def require_role(role: str):
    def checker(user=Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return checker


def hash_password(password: str):
    return password


def verify_password(password: str, hashed: str):
    return password == hashed
