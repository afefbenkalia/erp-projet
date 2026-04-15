from app.core.security import verify_password, create_token
from app.modules.auth.model import User


def login_user(db, email, password):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    token = create_token({
        "id": user.id,
        "email": user.email,
        "role": user.role
    })

    return {
        "token": token,
        "role": user.role
    }