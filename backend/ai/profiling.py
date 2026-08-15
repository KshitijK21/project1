from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd, os

from database.db import get_db
from models.dataset import Dataset
from models.data_profile import DataProfile
from services.profiling_service import profile_dataset

router = APIRouter(prefix="/profiling", tags=["Profiling"])

@router.post("/{dataset_id}")
def run_profiling(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    ext = os.path.splitext(dataset.file_path)[1].lower()
    df = pd.read_csv(dataset.file_path) if ext == ".csv" else pd.read_excel(dataset.file_path)
    result = profile_dataset(df)

    profile = DataProfile(dataset_id=dataset.id, health_score=result["health_score"],
                           missing_pct=result["missing_pct"], duplicate_pct=result["duplicate_pct"],
                           outlier_count=result["outlier_count"])
    db.add(profile)
    db.commit()
    return result

@router.get("/{dataset_id}/health")
def get_health(dataset_id: str, db: Session = Depends(get_db)):
    profile = db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).order_by(DataProfile.id.desc()).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Run POST /profiling/{dataset_id} first")
    status = "Good" if profile.health_score >= 80 else "Fair" if profile.health_score >= 60 else "Poor"
    return {"health_score": profile.health_score, "missing_percentage": profile.missing_pct,
            "duplicate_percentage": profile.duplicate_pct, "outliers": profile.outlier_count, "status": status}