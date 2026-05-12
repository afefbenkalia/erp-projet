# DISABLED: Authentication is now handled by the MES API at http://localhost:8000.
# ERP no longer manages its own user accounts. Running this script is not needed.
raise SystemExit("seed_admin is disabled. Auth is handled by the MES API.")

# --- original code preserved for reference ---
# from app.core.database import SessionLocal
# from app.modules.auth.model import User
#
# db = SessionLocal()
# db.query(User).filter(User.email == "admin@erp.com").delete()
# db.commit()
# admin = User(email="admin@erp.com", password="admin123", role="admin")
# db.add(admin)
# db.commit()
# db.close()
# print("ADMIN OK ✔")
