from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from models.audit_log import AuditLog
from services.rbac_service import require_admin

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db), admin=Depends(require_admin)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return {
        "count": len(logs),
        "logs": [
            {
                "user_email": log.user_email,
                "action": log.action,
                "endpoint": log.endpoint,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]
    }