from app.core.database import Base, engine
from app.modules.auth.model import User

Base.metadata.create_all(bind=engine)

print("Tables created")