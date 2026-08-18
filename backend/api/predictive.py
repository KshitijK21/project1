from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd, os

from database.db import get_db
from models.dataset import Dataset
from models.warehouse import Warehouse
from services.forecast_service import forecast_measure
from services.anomaly_service import detect_anomalies
from services.root_cause_service import root_cause_analysis

router = APIRouter(prefix="/predictive", tags=["Predictive AI"])


def _load_dataframe(dataset_id: str, db: Session) -> pd.DataFrame:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    ext = os.path.splitext(dataset.file_path)[1].lower()
    return pd.read_csv(dataset.file_path) if ext == ".csv" else pd.read_excel(dataset.file_path)


@router.post("/{dataset_id}/forecast")
def get_forecast(dataset_id: str, date_column: str, measure: str, periods: int = 7, db: Session = Depends(get_db)):
    df = _load_dataframe(dataset_id, db)
    try:
        result = forecast_measure(df, date_column, measure, periods)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.get("/{dataset_id}/anomalies")
def get_anomalies(dataset_id: str, measure: str, threshold: float = 2.0, db: Session = Depends(get_db)):
    df = _load_dataframe(dataset_id, db)
    anomalies = detect_anomalies(df, measure, threshold)
    return {"measure": measure, "threshold": threshold, "anomaly_count": len(anomalies), "anomalies": anomalies}


@router.get("/{dataset_id}/root-cause")
def get_root_cause(dataset_id: str, dimension: str, measure: str, db: Session = Depends(get_db)):
    df = _load_dataframe(dataset_id, db)
    result = root_cause_analysis(df, dimension, measure)
    return result