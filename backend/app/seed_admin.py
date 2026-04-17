from app.core.database import SessionLocal
from app.modules.auth.model import User

db = SessionLocal()

db.query(User).filter(User.email == "admin@erp.com").delete()
db.commit()

admin = User(
    email="admin@erp.com",
    password="admin123",
    role="admin"
)

db.add(admin)
db.commit()
db.close()

print("ADMIN OK ✔")