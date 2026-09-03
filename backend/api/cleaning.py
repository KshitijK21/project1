from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import pandas as pd, os

from database.db import get_db
from models.dataset import Dataset
from services.cleaning_service import generate_cleaning_suggestions, apply_cleaning
from utils.file_io import save_dataframe

router = APIRouter(prefix="/cleaning", tags=["Cleaning"])


class ApplyCleaningRequest(BaseModel):
    suggestion_ids: list = []


@router.post("/{dataset_id}/suggestions")
def get_cleaning_suggestions(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    ext = os.path.splitext(dataset.file_path)[1].lower()
    df = pd.read_csv(dataset.file_path) if ext == ".csv" else pd.read_excel(dataset.file_path)

    suggestions = generate_cleaning_suggestions(df)

    return {
        "dataset_id": dataset_id,
        "total_suggestions": len(suggestions),
        "suggestions": suggestions
    }


@router.post("/{dataset_id}/apply")
def apply_selected_cleaning(dataset_id: str, payload: ApplyCleaningRequest, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    ext = os.path.splitext(dataset.file_path)[1].lower()
    df = pd.read_csv(dataset.file_path) if ext == ".csv" else pd.read_excel(dataset.file_path)

    applied = apply_cleaning(df, payload.suggestion_ids)

    save_dataframe(applied["dataframe"], dataset.file_path, ext)

    dataset.row_count = len(applied["dataframe"])
    dataset.column_count = len(applied["dataframe"].columns)
    db.commit()

    return {
        "dataset_id": dataset_id,
        "operations_applied": applied["operations"],
        "rows_before": applied["rows_before"],
        "rows_after": applied["rows_after"],
        "rows_removed": applied["rows_before"] - applied["rows_after"]
    }