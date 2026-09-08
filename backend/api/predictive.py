from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd, os

from database.db import get_db
from models.dataset import Dataset
from services.forecast_service import forecast_measure
from services.anomaly_service import detect_anomalies
from services.root_cause_service import root_cause_analysis
from services.rbac_service import get_current_user, get_owned_dataset
from utils.file_io import load_dataframe

router = APIRouter(prefix="/predictive", tags=["Predictive AI"])


def _load_dataframe(dataset: Dataset) -> pd.DataFrame:
    return load_dataframe(dataset.file_path)


@router.post("/{dataset_id}/forecast")
def get_forecast(dataset: Dataset = Depends(get_owned_dataset), date_column: str = "", measure: str = "",
                 periods: int = 7, db: Session = Depends(get_db), user=Depends(get_current_user)):
    df = _load_dataframe(dataset)
    try:
        result = forecast_measure(df, date_column, measure, periods)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.get("/{dataset_id}/anomalies")
def get_anomalies(dataset: Dataset = Depends(get_owned_dataset), measure: str = "",
                  threshold: float = 2.0, db: Session = Depends(get_db), user=Depends(get_current_user)):
    df = _load_dataframe(dataset)
    anomalies = detect_anomalies(df, measure, threshold)
    return {"measure": measure, "threshold": threshold, "anomaly_count": len(anomalies), "anomalies": anomalies}


@router.get("/{dataset_id}/root-cause")
def get_root_cause(dataset: Dataset = Depends(get_owned_dataset), dimension: str = "", measure: str = "",
                   db: Session = Depends(get_db), user=Depends(get_current_user)):
    df = _load_dataframe(dataset)
    result = root_cause_analysis(df, dimension, measure)
    return result