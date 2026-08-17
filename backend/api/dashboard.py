from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database.db import get_db, engine
from models.warehouse import Warehouse
from services.dashboard_service import get_kpis, get_chart_data, get_drilldown

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _get_warehouse(dataset_id: str, db: Session) -> Warehouse:
    warehouse = db.query(Warehouse).filter(Warehouse.dataset_id == dataset_id).order_by(Warehouse.id.desc()).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Run warehouse generation first")
    return warehouse


@router.get("/{dataset_id}/kpis")
def dashboard_kpis(dataset_id: str, db: Session = Depends(get_db)):
    warehouse = _get_warehouse(dataset_id, db)
    kpis = get_kpis(warehouse.fact_table_name, warehouse.measures, engine)
    return {"dataset_id": dataset_id, "kpis": kpis}


@router.get("/{dataset_id}/chart")
def dashboard_chart(dataset_id: str, dimension: str, measure: str, aggregation: str = "SUM", db: Session = Depends(get_db)):
    warehouse = _get_warehouse(dataset_id, db)
    data = get_chart_data(warehouse.fact_table_name, dimension, measure, aggregation, engine)
    return {"dataset_id": dataset_id, "dimension": dimension, "measure": measure, "aggregation": aggregation, "data": data}


@router.get("/{dataset_id}/summary")
def dashboard_summary(dataset_id: str, db: Session = Depends(get_db)):
    warehouse = _get_warehouse(dataset_id, db)
    kpis = get_kpis(warehouse.fact_table_name, warehouse.measures, engine)

    charts = []
    if warehouse.measures and warehouse.dimensions:
        primary_measure = warehouse.measures[0]["column"]
        for dim in warehouse.dimensions:
            chart_data = get_chart_data(warehouse.fact_table_name, dim["column"], primary_measure, "SUM", engine)
            charts.append({"dimension": dim["column"], "measure": primary_measure, "data": chart_data})

    return {"dataset_id": dataset_id, "kpis": kpis, "charts": charts}


@router.get("/{dataset_id}/drilldown")
def dashboard_drilldown(dataset_id: str, dimension: str, value: str, db: Session = Depends(get_db)):
    warehouse = _get_warehouse(dataset_id, db)
    rows = get_drilldown(warehouse.fact_table_name, dimension, value, engine)
    return {"dataset_id": dataset_id, "dimension": dimension, "filtered_value": value, "row_count": len(rows), "rows": rows}