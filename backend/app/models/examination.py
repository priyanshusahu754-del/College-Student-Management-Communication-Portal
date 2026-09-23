from datetime import datetime
from app.extensions import db

class Examination(db.Model):
    __tablename__ = 'examinations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., 'Mid-Term Exam Fall 2024'
    academic_year = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    exam_type = db.Column(db.String(50), default='final', nullable=False)  # 'midterm', 'final', 'quiz', 'practical'
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    results = db.relationship('Result', back_populates='examination', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'exam_type': self.exam_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_published': self.is_published,
            'results_count': len(self.results) if self.results else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Result(db.Model):
    __tablename__ = 'results'

    id = db.Column(db.Integer, primary_key=True)
    examination_id = db.Column(db.Integer, db.ForeignKey('examinations.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    marks_obtained = db.Column(db.Float, nullable=False)
    maximum_marks = db.Column(db.Float, default=100.0, nullable=False)
    grade = db.Column(db.String(5), nullable=True)  # 'A+', 'A', 'B', 'C', 'D', 'F'
    remarks = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    examination = db.relationship('Examination', back_populates='results')
    student = db.relationship('Student', back_populates='results')
    subject = db.relationship('Subject', back_populates='results')

    __table_args__ = (
        db.UniqueConstraint('examination_id', 'student_id', 'subject_id', name='uq_exam_student_subject_result'),
    )

    def calculate_grade(self):
        if self.maximum_marks <= 0:
            return 'F'
        percentage = (self.marks_obtained / self.maximum_marks) * 100
        if percentage >= 90:
            return 'A+'
        elif percentage >= 80:
            return 'A'
        elif percentage >= 70:
            return 'B'
        elif percentage >= 60:
            return 'C'
        elif percentage >= 50:
            return 'D'
        elif percentage >= 40:
            return 'E'
        else:
            return 'F'

    def to_dict(self):
        return {
            'id': self.id,
            'examination_id': self.examination_id,
            'examination_name': self.examination.name if self.examination else None,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'enrollment_number': self.student.enrollment_number if self.student else None,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_code': self.subject.code if self.subject else None,
            'credits': self.subject.credits if self.subject else 0,
            'marks_obtained': self.marks_obtained,
            'maximum_marks': self.maximum_marks,
            'percentage': round((self.marks_obtained / self.maximum_marks) * 100, 2) if self.maximum_marks > 0 else 0,
            'grade': self.grade or self.calculate_grade(),
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
