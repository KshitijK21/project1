from fastapi import FastAPI
from database.db import Base, engine
from models import dataset, data_profile ,warehouse
from api import dataset as dataset_router, profiling,cleaning,warehouse as warehouse_router,ai,dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Autonomous Business Intelligence Platform", version="1.0.0")

app.include_router(dataset_router.router)
app.include_router(profiling.router)
app.include_router(cleaning.router)
app.include_router(warehouse_router.router)
app.include_router(ai.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Autonomous BI Platform API is running"}