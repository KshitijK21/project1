from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd, os, uuid

from database.db import get_db
from models.dataset import Dataset
from models.warehouse import Warehouse
from services.warehouse_service import generate_star_schema

router = APIRouter(prefix="/warehouse", tags=["Warehouse"])


@router.post("/{dataset_id}/generate")
def generate_warehouse(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    ext = os.path.splitext(dataset.file_path)[1].lower()
    df = pd.read_csv(dataset.file_path) if ext == ".csv" else pd.read_excel(dataset.file_path)

    schema = generate_star_schema(df, dataset.name)

    warehouse = Warehouse(
        id=uuid.uuid4(),
        dataset_id=dataset.id,
        fact_table_name=schema["fact_table_name"],
        measures=schema["measures"],
        dimensions=schema["dimensions"],
        data_dictionary=schema["data_dictionary"]
    )
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return {
        "warehouse_id": str(warehouse.id),
        "dataset_id": dataset_id,
        "fact_table_name": warehouse.fact_table_name,
        "measures": warehouse.measures,
        "dimensions": warehouse.dimensions,
        "data_dictionary": warehouse.data_dictionary
    }


@router.get("/{dataset_id}")
def get_warehouse(dataset_id: str, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.dataset_id == dataset_id).order_by(Warehouse.id.desc()).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Run POST /warehouse/{dataset_id}/generate first")

    return {
        "warehouse_id": str(warehouse.id),
        "fact_table_name": warehouse.fact_table_name,
        "measures": warehouse.measures,
        "dimensions": warehouse.dimensions,
        "data_dictionary": warehouse.data_dictionary
    }