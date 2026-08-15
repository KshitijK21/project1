from sqlalchemy import Column, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from database.db import Base
import uuid

class DataProfile(Base):
    __tablename__ = "data_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True))
    health_score = Column(Float)
    missing_pct = Column(Float)
    duplicate_pct = Column(Float)
    outlier_count = Column(Integer)