import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# load .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    echo=False,          # echo=True floods stderr and slows every query
    pool_size=10,        # concurrent sessions (default 5 was too small)
    max_overflow=5,      # extra connections allowed beyond pool_size
    pool_timeout=30,     # seconds to wait for a free connection before raising
    pool_pre_ping=True,  # discard stale connections transparently
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()