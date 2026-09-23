from datetime import datetime
from app.extensions import db

class Notice(db.Model):
    __tablename__ = 'notices'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    audience = db.Column(db.String(30), default='all', nullable=False)  # 'all', 'students', 'teachers', 'department'
    target_department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    priority = db.Column(db.String(20), default='medium', nullable=False)  # 'low', 'medium', 'high', 'urgent'
    published_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    author = db.relationship('User', foreign_keys=[created_by])
    target_department = db.relationship('Department', foreign_keys=[target_department_id])

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_by': self.created_by,
            'author_name': self.author.full_name if self.author else 'System',
            'audience': self.audience,
            'target_department_id': self.target_department_id,
            'target_department_name': self.target_department.name if self.target_department else None,
            'priority': self.priority,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    venue = db.Column(db.String(200), nullable=False)
    start_datetime = db.Column(db.DateTime, nullable=False, index=True)
    end_datetime = db.Column(db.DateTime, nullable=False)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    capacity = db.Column(db.Integer, default=100, nullable=True)
    status = db.Column(db.String(20), default='upcoming', nullable=False)  # 'upcoming', 'ongoing', 'completed', 'cancelled'
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organizer = db.relationship('User', foreign_keys=[organizer_id])
    registrations = db.relationship('EventRegistration', back_populates='event', cascade='all, delete-orphan')

    def to_dict(self, student_id=None):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'venue': self.venue,
            'start_datetime': self.start_datetime.isoformat() if self.start_datetime else None,
            'end_datetime': self.end_datetime.isoformat() if self.end_datetime else None,
            'organizer_id': self.organizer_id,
            'organizer_name': self.organizer.full_name if self.organizer else None,
            'capacity': self.capacity,
            'registered_count': len(self.registrations) if self.registrations else 0,
            'status': self.status,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if student_id:
            reg = next((r for r in self.registrations if r.student_id == student_id), None)
            data['is_registered'] = reg is not None
            data['registration_status'] = reg.status if reg else None
        return data


class EventRegistration(db.Model):
    __tablename__ = 'event_registrations'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(20), default='registered', nullable=False)  # 'registered', 'attended', 'cancelled'

    # Relationships
    event = db.relationship('Event', back_populates='registrations')
    student = db.relationship('Student', back_populates='event_registrations')

    __table_args__ = (
        db.UniqueConstraint('event_id', 'student_id', name='uq_event_student_registration'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'event_title': self.event.title if self.event else None,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'enrollment_number': self.student.enrollment_number if self.student else None,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None,
            'status': self.status
        }
