from sqlalchemy.orm import Session
from models.audit_log import AuditLog
import uuid

def log_action(db: Session, user_id, user_email: str, action: str, endpoint: str):
    entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        user_email=user_email,
        action=action,
        endpoint=endpoint
    )
    db.add(entry)
    db.commit()