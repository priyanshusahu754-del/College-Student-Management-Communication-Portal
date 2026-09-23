# Dates aur timestamps handle karne ke liye datetime import kar rahe hain
from datetime import datetime
# SQLAlchemy database instance extensions se import kar rahe hain
from app.extensions import db

# Assignments Model: Faculty dwara create kiye gaye homework / project assignments
class Assignment(db.Model):
    # Database me table ka naam 'assignments'
    __tablename__ = 'assignments'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Assignment ka title / headline
    title = db.Column(db.String(200), nullable=False)
    # Assignment ke poore instructions aur requirements
    description = db.Column(db.Text, nullable=False)
    # Subject table se foreign key relation
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    # Assignment post karne wale Teacher ki foreign key
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id', ondelete='CASCADE'), nullable=False)
    # Submission ki last deadline (Due date, indexed for fast filtering)
    due_date = db.Column(db.DateTime, nullable=False, index=True)
    # Total maximum marks (Default 100.0)
    total_marks = db.Column(db.Float, default=100.0, nullable=False)
    # Attached reference file ka server storage path
    attachment_path = db.Column(db.String(255), nullable=True)
    # Attached reference file ka original file name
    attachment_name = db.Column(db.String(255), nullable=True)
    # Assignment publication status ('published', 'draft', 'closed')
    status = db.Column(db.String(20), default='published', nullable=False)  # 'published', 'draft', 'closed'
    # Creation timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Last update timestamp
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships: Subject, Teacher aur Students ke dwara ki gayi Submissions
    subject = db.relationship('Subject', back_populates='assignments')
    teacher = db.relationship('Teacher', back_populates='assignments')
    submissions = db.relationship('AssignmentSubmission', back_populates='assignment', cascade='all, delete-orphan')

    # Assignment object ko dictionary me convert karne ka helper method
    def to_dict(self, student_id=None):
        # Base assignment properties format kar rahe hain
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_code': self.subject.code if self.subject else None,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.user.full_name if self.teacher and self.teacher.user else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'total_marks': self.total_marks,
            'attachment_path': self.attachment_path,
            'attachment_name': self.attachment_name,
            'status': self.status,
            'submissions_count': len(self.submissions) if self.submissions else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        # Agar student_id pass kiya ho toh uss student ki specific submission status bhi attach karte hain
        if student_id:
            sub = next((s for s in self.submissions if s.student_id == student_id), None)
            data['my_submission'] = sub.to_dict() if sub else None
        return data


# Assignment Submissions Model: Students dwara submit kiye gaye answers/files aur grading details
class AssignmentSubmission(db.Model):
    # Database table ka naam
    __tablename__ = 'assignment_submissions'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Assignment foreign key link
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False)
    # Student foreign key link
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    # Textual solution / comments
    submission_text = db.Column(db.Text, nullable=True)
    # Uploaded file ka server path
    file_path = db.Column(db.String(255), nullable=True)
    # Uploaded file ka original display name
    file_name = db.Column(db.String(255), nullable=True)
    # Submission ka timestamp
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Submission status ('submitted', 'late', 'graded')
    status = db.Column(db.String(20), default='submitted', nullable=False)  # 'submitted', 'late', 'graded'
    # Teacher dwara award kiye gaye marks
    marks = db.Column(db.Float, nullable=True)
    # Teacher ka feedback / review comments
    feedback = db.Column(db.Text, nullable=True)
    # Marks dene ka timestamp
    graded_at = db.Column(db.DateTime, nullable=True)
    # Grading karne wale Teacher ki ID
    graded_by_id = db.Column(db.Integer, db.ForeignKey('teachers.id', ondelete='SET NULL'), nullable=True)

    # Relationships
    assignment = db.relationship('Assignment', back_populates='submissions')
    student = db.relationship('Student', back_populates='submissions')
    graded_by = db.relationship('Teacher', foreign_keys=[graded_by_id])

    # Ek student ek assignment ke liye ek hi primary submission record rakh sakta hai
    __table_args__ = (
        db.UniqueConstraint('assignment_id', 'student_id', name='uq_assignment_student_submission'),
    )

    # Submission object ko serialize karne ka method
    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'total_marks': self.assignment.total_marks if self.assignment else None,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'enrollment_number': self.student.enrollment_number if self.student else None,
            'submission_text': self.submission_text,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'status': self.status,
            'marks': self.marks,
            'feedback': self.feedback,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None,
            'graded_by_name': self.graded_by.user.full_name if self.graded_by and self.graded_by.user else None
        }

