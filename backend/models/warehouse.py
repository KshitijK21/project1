from sqlalchemy import Column, String, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from database.db import Base
import uuid

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), nullable=False)
    fact_table_name = Column(String)
    measures = Column(JSON)       # list of numeric columns treated as measures
    dimensions = Column(JSON)     # list of dimension table definitions
    data_dictionary = Column(JSON)  # column-level metadata