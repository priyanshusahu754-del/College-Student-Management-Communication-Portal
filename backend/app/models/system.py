from datetime import datetime
from app.extensions import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='system', nullable=False)  # 'assignment', 'attendance', 'notice', 'event', 'result', 'system'
    link = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    recipient = db.relationship('User', back_populates='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'recipient_user_id': self.recipient_user_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'link': self.link,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    actor_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False)  # e.g., 'USER_CREATED', 'ATTENDANCE_MARKED', 'GRADE_SUBMITTED'
    entity_type = db.Column(db.String(50), nullable=False)  # e.g., 'user', 'attendance', 'assignment', 'result'
    entity_id = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    metadata_json = db.Column(db.Text, nullable=True)  # sanitized JSON metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    actor = db.relationship('User', back_populates='audit_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'actor_user_id': self.actor_user_id,
            'actor_name': self.actor.full_name if self.actor else 'System/Anonymous',
            'actor_email': self.actor.email if self.actor else None,
            'actor_role': self.actor.role if self.actor else None,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'metadata': self.metadata_json,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
