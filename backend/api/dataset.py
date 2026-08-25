from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import os, shutil, pandas as pd, uuid, json

from database.db import get_db
from models.dataset import Dataset

router = APIRouter(prefix="/datasets", tags=["Datasets"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    df = pd.read_csv(file_path) if extension == ".csv" else pd.read_excel(file_path)

    dataset = Dataset(
        id=uuid.uuid4(), name=file.filename, source_type=extension.replace(".", ""),
        status="uploaded", file_path=file_path, row_count=len(df), column_count=len(df.columns)
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return {"dataset_id": str(dataset.id), "filename": file.filename,
            "rows": dataset.row_count, "columns": dataset.column_count, "status": "uploaded"}


@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    ext = os.path.splitext(dataset.file_path)[1].lower()
    df = pd.read_csv(dataset.file_path) if ext == ".csv" else pd.read_excel(dataset.file_path)

    preview_json = df.head(10).to_json(orient="records")
    preview_data = json.loads(preview_json)

    return {"filename": dataset.name, "rows": dataset.row_count,
            "columns": dataset.column_count, "preview": preview_data}

@router.get("")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.id.desc()).all()
    return [
        {
            "dataset_id": str(d.id),
            "filename": d.name,
            "rows": d.row_count,
            "columns": d.column_count,
            "status": d.status
        }
        for d in datasets
    ]