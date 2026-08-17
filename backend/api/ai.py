from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd

from database.db import get_db, engine
from models.warehouse import Warehouse
from services.ai_service import generate_sql, explain_result

router = APIRouter(prefix="/ai", tags=["AI Analytics"])

FORBIDDEN_KEYWORDS = ["insert", "update", "delete", "drop", "alter", "truncate", "create"]


@router.post("/{dataset_id}/query")
def natural_language_query(dataset_id: str, question: str, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.dataset_id == dataset_id).order_by(Warehouse.id.desc()).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Run warehouse generation first")

    columns = [m["column"] for m in warehouse.measures] + [d["column"] for d in warehouse.dimensions]

    sql = generate_sql(question, warehouse.fact_table_name, columns)

    # Safety check — block anything that isn't a pure SELECT
    if not sql.lower().strip().startswith("select"):
        raise HTTPException(status_code=400, detail="Generated query was not a SELECT statement")
    if any(keyword in sql.lower() for keyword in FORBIDDEN_KEYWORDS):
        raise HTTPException(status_code=400, detail="Generated query contained a forbidden operation")

    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            rows = [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL execution failed: {str(e)}")

    explanation = explain_result(question, rows)

    return {
        "question": question,
        "generated_sql": sql,
        "result": rows,
        "explanation": explanation
    }