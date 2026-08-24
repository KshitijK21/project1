from fastapi import FastAPI
from database.db import Base, engine
from models import dataset, data_profile, warehouse, user, audit_log
from api import dataset as dataset_router, profiling, cleaning, warehouse as warehouse_router, ai, dashboard, predictive, auth, audit, report
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Autonomous Business Intelligence Platform", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset_router.router)
app.include_router(profiling.router)
app.include_router(cleaning.router)
app.include_router(warehouse_router.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(predictive.router)
app.include_router(auth.router)
app.include_router(audit.router)
app.include_router(report.router)

@app.get("/")
def root():
    return {"message": "Autonomous BI Platform API is running"}