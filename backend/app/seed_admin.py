from app.core.database import SessionLocal
from app.modules.auth.model import User
from app.core.security import hash_password

def create_admin():
    db = SessionLocal()

    existing = db.query(User).filter(User.email == "admin@erp.com").first()

    if existing:
        print("Admin already exists ✔")
        return

    admin = User(
        email="admin@erp.com",
        password=hash_password("admin123"),
        role="admin"
    )

    db.add(admin)
    db.commit()
    db.close()

    print("Admin created ✔")

if __name__ == "__main__":
    create_admin()