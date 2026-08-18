from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from database.db import get_db, engine
from models.dataset import Dataset
from models.data_profile import DataProfile
from models.warehouse import Warehouse
from services.report_service import generate_recommendations, generate_executive_summary
from services.pdf_service import generate_pdf_report
from services.ppt_service import generate_ppt_report
from services.dashboard_service import get_kpis
from services.rbac_service import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


def _gather_report_data(dataset_id: str, db: Session):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    profile = db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).order_by(DataProfile.id.desc()).first()
    warehouse = db.query(Warehouse).filter(Warehouse.dataset_id == dataset_id).order_by(Warehouse.id.desc()).first()
    if not profile or not warehouse:
        raise HTTPException(status_code=400, detail="Run profiling and warehouse generation first")

    profile_data = {"health_score": profile.health_score, "missing_pct": profile.missing_pct, "duplicate_pct": profile.duplicate_pct}
    warehouse_data = {"measures": warehouse.measures, "dimensions": warehouse.dimensions}
    kpis = get_kpis(warehouse.fact_table_name, warehouse.measures, engine)

    return dataset, profile_data, warehouse_data, kpis


@router.get("/{dataset_id}/recommendations")
def get_recommendations(dataset_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _, profile_data, warehouse_data, _ = _gather_report_data(dataset_id, db)
    recommendations = generate_recommendations(profile_data, warehouse_data)
    return {"dataset_id": dataset_id, "recommendations": recommendations}


@router.get("/{dataset_id}/executive-summary")
def get_executive_summary(dataset_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _, profile_data, warehouse_data, kpis = _gather_report_data(dataset_id, db)
    summary = generate_executive_summary(profile_data, warehouse_data, kpis)
    return {"dataset_id": dataset_id, "executive_summary": summary}


@router.get("/{dataset_id}/pdf")
def download_pdf_report(dataset_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    dataset, profile_data, warehouse_data, kpis = _gather_report_data(dataset_id, db)
    summary = generate_executive_summary(profile_data, warehouse_data, kpis)
    recommendations = generate_recommendations(profile_data, warehouse_data)
    filepath = generate_pdf_report(dataset.name.replace(".csv", ""), summary, kpis, recommendations)
    return FileResponse(filepath, media_type="application/pdf", filename=os.path.basename(filepath))


@router.get("/{dataset_id}/ppt")
def download_ppt_report(dataset_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    dataset, profile_data, warehouse_data, kpis = _gather_report_data(dataset_id, db)
    summary = generate_executive_summary(profile_data, warehouse_data, kpis)
    recommendations = generate_recommendations(profile_data, warehouse_data)
    filepath = generate_ppt_report(dataset.name.replace(".csv", ""), summary, kpis, recommendations)
    return FileResponse(filepath, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", filename=os.path.basename(filepath))