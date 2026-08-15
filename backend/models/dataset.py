from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from database.db import Base
import uuid

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    source_type = Column(String)
    workspace_id = Column(UUID(as_uuid=True), nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String)
    file_path = Column(String)
    row_count = Column(Integer)
    column_count = Column(Integer)