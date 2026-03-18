from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    future=True,
)

Base = declarative_base()