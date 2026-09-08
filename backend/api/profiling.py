from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import os

from database.db import get_db
from models.dataset import Dataset
from models.data_profile import DataProfile
from services.profiling_service import profile_dataset
from services.rbac_service import get_current_user, get_owned_dataset
from utils.file_io import load_dataframe

router = APIRouter(prefix="/profiling", tags=["Profiling"])

@router.post("/{dataset_id}")
def run_profiling(dataset: Dataset = Depends(get_owned_dataset), db: Session = Depends(get_db),
                  user=Depends(get_current_user)):
    ext = os.path.splitext(dataset.file_path)[1].lower()
    df = load_dataframe(dataset.file_path)
    result = profile_dataset(df)

    profile = DataProfile(dataset_id=dataset.id, health_score=result["health_score"],
                           missing_pct=result["missing_pct"], duplicate_pct=result["duplicate_pct"],
                           outlier_count=result["outlier_count"])
    db.add(profile)
    db.commit()
    return result

@router.get("/{dataset_id}/health")
def get_health(dataset: Dataset = Depends(get_owned_dataset), db: Session = Depends(get_db),
               user=Depends(get_current_user)):
    profile = db.query(DataProfile).filter(DataProfile.dataset_id == dataset.id).order_by(DataProfile.id.desc()).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Run POST /profiling/{dataset_id} first")
    status = "Good" if profile.health_score >= 80 else "Fair" if profile.health_score >= 60 else "Poor"
    return {"health_score": profile.health_score, "missing_percentage": profile.missing_pct,
            "duplicate_percentage": profile.duplicate_pct, "outliers": profile.outlier_count, "status": status}