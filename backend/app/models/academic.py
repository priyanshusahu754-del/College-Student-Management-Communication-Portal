# Timestamps generate karne ke liye datetime module import kar rahe hain
from datetime import datetime
# SQLAlchemy database instance ko extensions se import kar rahe hain
from app.extensions import db

# College ke Departments (e.g. Computer Science, Mechanical) ka Database Model
class Department(db.Model):
    # Database me table ka naam 'departments' set kar rahe hain
    __tablename__ = 'departments'

    # Primary key ID column (Auto-increment integer)
    id = db.Column(db.Integer, primary_key=True)
    # Department ka unique name (e.g., 'Computer Science & Engineering')
    name = db.Column(db.String(100), nullable=False, unique=True)
    # Department ka unique short code (e.g., 'CSE'), fast search ke liye index lagaya hai
    code = db.Column(db.String(20), nullable=False, unique=True, index=True)
    # Department ke baare me optional description text
    description = db.Column(db.Text, nullable=True)
    # Record creation ka UTC timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships: Ek Department me multiple Courses, Students aur Teachers ho sakte hain
    courses = db.relationship('Course', back_populates='department', cascade='all, delete-orphan')
    students = db.relationship('Student', back_populates='department')
    teachers = db.relationship('Teacher', back_populates='department')

    # Department object ko JSON serializable dictionary me convert karne ka method
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            # Timestamp ko ISO format string me convert kar rahe hain
            'created_at': self.created_at.isoformat() if self.created_at else None,
            # Total courses, students aur teachers ki count calculate kar rahe hain
            'courses_count': len(self.courses) if self.courses else 0,
            'students_count': len(self.students) if self.students else 0,
            'teachers_count': len(self.teachers) if self.teachers else 0
        }


# Degree Courses (e.g., B.Tech, M.Tech, BCA) ka Database Model
class Course(db.Model):
    # Database me table ka naam 'courses' set kar rahe hain
    __tablename__ = 'courses'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Course ka poora naam (e.g., 'Bachelor of Technology')
    name = db.Column(db.String(100), nullable=False)
    # Course ka unique code (e.g., 'BTECH-CSE')
    code = db.Column(db.String(20), nullable=False, unique=True, index=True)
    # Department table ke saath foreign key link (Department delete hone par CASCADE delete)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='CASCADE'), nullable=False)
    # Total semesters ki count (Default 8 semesters)
    semester_count = db.Column(db.Integer, default=8, nullable=False)
    # Current academic session (e.g., '2024-2025')
    academic_year = db.Column(db.String(20), nullable=True)  # e.g., '2024-2025'
    # Record creation ka UTC timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships: Course ka parent Department, associated Subjects aur enrolled Students
    department = db.relationship('Department', back_populates='courses')
    subjects = db.relationship('Subject', back_populates='course', cascade='all, delete-orphan')
    students = db.relationship('Student', back_populates='course')

    # Course object ko API response ke liye dictionary me format kar rahe hain
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'semester_count': self.semester_count,
            'academic_year': self.academic_year,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'subjects_count': len(self.subjects) if self.subjects else 0
        }


# Subject / Course Syllabus Subjects (e.g., Data Structures, DBMS) ka Model
class Subject(db.Model):
    # Database me table ka naam 'subjects' set kar rahe hain
    __tablename__ = 'subjects'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Subject ka full title (e.g., 'Operating Systems')
    name = db.Column(db.String(100), nullable=False)
    # Subject ka unique code (e.g., 'CS401')
    code = db.Column(db.String(20), nullable=False, unique=True, index=True)
    # Course table se foreign key relation
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    # Konsa semester me ye subject padhaya jata hai (e.g. 4)
    semester = db.Column(db.Integer, nullable=False)
    # Subject ke credit points (Default 4 credits)
    credits = db.Column(db.Integer, default=4, nullable=False)
    # Record creation timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships: Course, assigned Teachers, enrolled Students, Attendance, Assignments, Materials aur Results
    course = db.relationship('Course', back_populates='subjects')
    teacher_assignments = db.relationship('TeacherSubjectAssignment', back_populates='subject', cascade='all, delete-orphan')
    enrollments = db.relationship('Enrollment', back_populates='subject', cascade='all, delete-orphan')
    attendance_sessions = db.relationship('AttendanceSession', back_populates='subject', cascade='all, delete-orphan')
    assignments = db.relationship('Assignment', back_populates='subject', cascade='all, delete-orphan')
    materials = db.relationship('StudyMaterial', back_populates='subject', cascade='all, delete-orphan')
    results = db.relationship('Result', back_populates='subject', cascade='all, delete-orphan')

    # Subject details ko JSON format me convert karne ka method
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else None,
            'department_name': self.course.department.name if self.course and self.course.department else None,
            'semester': self.semester,
            'credits': self.credits,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Student Profile Model: Student-specific academic metadata store karne ke liye
class Student(db.Model):
    # Database me table ka naam 'students'
    __tablename__ = 'students'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Users table se one-to-one foreign key mapping (Unique constraint ke saath)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    # College enrollment/roll number (e.g., 'EN2024CS001')
    enrollment_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    # Department foreign key reference
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    # Enrolled Course foreign key reference
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    # Current active semester (e.g., 5th semester)
    current_semester = db.Column(db.Integer, default=1, nullable=False)
    # Year of admission (e.g., 2024)
    admission_year = db.Column(db.Integer, nullable=False)
    # Date of birth
    date_of_birth = db.Column(db.Date, nullable=True)
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='student_profile')
    department = db.relationship('Department', back_populates='students')
    course = db.relationship('Course', back_populates='students')
    enrollments = db.relationship('Enrollment', back_populates='student', cascade='all, delete-orphan')
    attendance_records = db.relationship('AttendanceRecord', back_populates='student', cascade='all, delete-orphan')
    submissions = db.relationship('AssignmentSubmission', back_populates='student', cascade='all, delete-orphan')
    event_registrations = db.relationship('EventRegistration', back_populates='student', cascade='all, delete-orphan')
    results = db.relationship('Result', back_populates='student', cascade='all, delete-orphan')

    # Student full profile dictionary helper method
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'avatar_url': self.user.avatar_url if self.user else None,
            'enrollment_number': self.enrollment_number,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else None,
            'current_semester': self.current_semester,
            'admission_year': self.admission_year,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'is_active': self.user.is_active if self.user else True,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Teacher / Faculty Profile Model
class Teacher(db.Model):
    # Database me table ka naam 'teachers'
    __tablename__ = 'teachers'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Users table se one-to-one foreign key link
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    # Faculty employee ID (e.g., 'EMP1001')
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    # Assigned Department foreign key reference
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    # Designation (e.g., 'Assistant Professor', 'HOD')
    designation = db.Column(db.String(100), default='Assistant Professor', nullable=False)
    # Highest qualification (e.g., 'Ph.D. in Computer Science', 'M.Tech')
    qualification = db.Column(db.String(150), nullable=True)
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='teacher_profile')
    department = db.relationship('Department', back_populates='teachers')
    subject_assignments = db.relationship('TeacherSubjectAssignment', back_populates='teacher', cascade='all, delete-orphan')
    attendance_sessions = db.relationship('AttendanceSession', back_populates='teacher')
    assignments = db.relationship('Assignment', back_populates='teacher')

    # Teacher profile dictionary serialize karne ka method
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'avatar_url': self.user.avatar_url if self.user else None,
            'employee_id': self.employee_id,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'designation': self.designation,
            'qualification': self.qualification,
            'is_active': self.user.is_active if self.user else True,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Teacher-Subject Mapping Model: Konsa Teacher konsa Subject padha raha hai
class TeacherSubjectAssignment(db.Model):
    # Database me table ka naam
    __tablename__ = 'teacher_subject_assignments'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Teacher foreign key reference
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id', ondelete='CASCADE'), nullable=False)
    # Subject foreign key reference
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    # Academic session year (e.g., '2024-2025')
    academic_year = db.Column(db.String(20), nullable=False)  # e.g., '2024-2025'
    # Semester number
    semester = db.Column(db.Integer, nullable=False)
    # Creation timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    teacher = db.relationship('Teacher', back_populates='subject_assignments')
    subject = db.relationship('Subject', back_populates='teacher_assignments')

    # Ek teacher ek subject ko ek academic year me ek hi baar assign ho sakta hai (Unique constraint)
    __table_args__ = (
        db.UniqueConstraint('teacher_id', 'subject_id', 'academic_year', name='uq_teacher_subject_year'),
    )

    # Assignment details dictionary helper
    def to_dict(self):
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.user.full_name if self.teacher and self.teacher.user else None,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_code': self.subject.code if self.subject else None,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Student Subject Enrollment Model: Konsa student kis subject me enrolled hai
class Enrollment(db.Model):
    # Database table name
    __tablename__ = 'enrollments'

    # Primary key ID column
    id = db.Column(db.Integer, primary_key=True)
    # Enrolled Student ID
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    # Subject ID jisme enroll hua hai
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    # Academic session
    academic_year = db.Column(db.String(20), nullable=False)
    # Semester number
    semester = db.Column(db.Integer, nullable=False)
    # Enrollment status ('active', 'completed', 'dropped')
    status = db.Column(db.String(20), default='active', nullable=False)  # 'active', 'completed', 'dropped'
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    student = db.relationship('Student', back_populates='enrollments')
    subject = db.relationship('Subject', back_populates='enrollments')

    # Ek student ek subject me ek academic year me ek hi baar enroll ho sakta hai (Unique constraint)
    __table_args__ = (
        db.UniqueConstraint('student_id', 'subject_id', 'academic_year', name='uq_student_subject_year'),
    )

    # Enrollment dictionary helper
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'enrollment_number': self.student.enrollment_number if self.student else None,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_code': self.subject.code if self.subject else None,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

