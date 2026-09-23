import json
from flask import request
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.system import AuditLog

def log_audit_action(action: str, entity_type: str, entity_id: int = None, metadata: dict = None, actor_user_id: int = None):
    """
    Safely log administrative/system action without capturing sensitive secrets.
    """
    try:
        if actor_user_id is None:
            try:
                identity = get_jwt_identity()
                if identity:
                    actor_user_id = int(identity)
            except Exception:
                actor_user_id = None

        ip_address = request.remote_addr if request else None
        user_agent = request.user_agent.string if request and request.user_agent else None

        # Sanitize metadata to strip passwords, tokens, hashes
        sanitized_meta = None
        if metadata:
            safe_meta = {}
            for k, v in metadata.items():
                if any(secret_term in k.lower() for secret_term in ['password', 'token', 'secret', 'hash', 'authorization']):
                    continue
                safe_meta[k] = str(v)
            sanitized_meta = json.dumps(safe_meta)

        audit_entry = AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata_json=sanitized_meta
        )
        db.session.add(audit_entry)
        db.session.commit()
    except Exception as e:
        # Avoid crashing the request if audit logging fails
        db.session.rollback()
