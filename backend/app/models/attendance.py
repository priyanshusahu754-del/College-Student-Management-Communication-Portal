# Date aur datetime objects handle karne ke liye datetime standard module import kar rahe hain
from datetime import datetime, date
# SQLAlchemy database instance extensions se import kar rahe hain
from app.extensions import db

# Attendance Session Model: Daily lecture/class attendance session record
class AttendanceSession(db.Model):
    # Database me table ka naam
    __tablename__ = 'attendance_sessions'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Subject table se foreign key relation (Subject delete hone par cascade delete)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    # Class lene wale Teacher ki foreign key
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id', ondelete='SET NULL'), nullable=True)
    # Lecture ki date (Default: aaj ki date, indexed for fast query)
    session_date = db.Column(db.Date, default=date.today, nullable=False, index=True)
    # Class ka start time (e.g., '10:00 AM')
    start_time = db.Column(db.String(20), nullable=True)
    # Lecture topic description (e.g., 'Binary Search Trees implementation')
    topic = db.Column(db.String(200), nullable=True)
    # Creation timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    subject = db.relationship('Subject', back_populates='attendance_sessions')
    teacher = db.relationship('Teacher', back_populates='attendance_sessions')
    records = db.relationship('AttendanceRecord', back_populates='session', cascade='all, delete-orphan')

    # Session details ko serialize karne ka method
    def to_dict(self, include_records=False):
        # Base dictionary object create kar rahe hain
        data = {
            'id': self.id,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_code': self.subject.code if self.subject else None,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.user.full_name if self.teacher and self.teacher.user else None,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'start_time': self.start_time,
            'topic': self.topic,
            'total_marked': len(self.records) if self.records else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        # Agar include_records True ho toh saare students ke attendance records bhi list me add karte hain
        if include_records:
            data['records'] = [record.to_dict() for record in self.records]
        return data


# Attendance Record Model: Individual student ki attendance status (Present, Absent, Late)
class AttendanceRecord(db.Model):
    # Database table ka naam
    __tablename__ = 'attendance_records'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Attendance session foreign key reference
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.id', ondelete='CASCADE'), nullable=False)
    # Student foreign key reference
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    # Status value ('present', 'absent', 'late', 'excused')
    status = db.Column(db.String(20), nullable=False)
    # Teacher ke remarks / notes
    remarks = db.Column(db.String(255), nullable=True)
    # Attendance mark karne ka timestamp
    marked_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Update timestamp
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    session = db.relationship('AttendanceSession', back_populates='records')
    student = db.relationship('Student', back_populates='attendance_records')

    # Ek session me ek student ka sirf ek hi attendance record hona chahiye (Unique Constraint)
    __table_args__ = (
        db.UniqueConstraint('session_id', 'student_id', name='uq_session_student_attendance'),
    )

    # Attendance record serialize karne ka method
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'enrollment_number': self.student.enrollment_number if self.student else None,
            'status': self.status,
            'remarks': self.remarks,
            'session_date': self.session.session_date.isoformat() if self.session and self.session.session_date else None,
            'subject_name': self.session.subject.name if self.session and self.session.subject else None,
            'subject_code': self.session.subject.code if self.session and self.session.subject else None,
            'marked_at': self.marked_at.isoformat() if self.marked_at else None
        }

