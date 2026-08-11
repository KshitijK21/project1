from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Load variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Creates the connection engine
engine = create_engine(DATABASE_URL)

# Creates a session factory - each request gets its own DB session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all your ORM models (tables) will inherit from
Base = declarative_base()

# Dependency function - FastAPI will call this per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()