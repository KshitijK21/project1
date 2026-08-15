from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd, os

from database.db import get_db
from models.dataset import Dataset
from services.cleaning_service import generate_cleaning_suggestions

router = APIRouter(prefix="/cleaning", tags=["Cleaning"])


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