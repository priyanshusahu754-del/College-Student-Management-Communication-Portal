# Flask routing aur request parsing modules
from flask import Blueprint, request
# JWT authentication functions (Tokens verify karne aur claims check karne ke liye)
from flask_jwt_extended import jwt_required, get_jwt_identity
# SQLAlchemy database session
from app.extensions import db
# Academic Models (Departments, Courses, Subjects, Assignments, Enrollments)
from app.models.academic import Department, Course, Subject, TeacherSubjectAssignment, Enrollment, Student, Teacher
# User model
from app.models.user import User
# Standardized API response utilities
from app.utils.responses import api_response, error_response
# Access control decorators
from app.utils.decorators import admin_required, role_required
# Audit trail logger
from app.utils.audit import log_audit_action

# Academic structure manage karne ke liye Blueprint create kar rahe hain
academic_bp = Blueprint('academic', __name__, url_prefix='/api/v1')

# ----------------- DEPARTMENTS MANAGEMENT -----------------
# Route: Saare departments ki list fetch karna
@academic_bp.route('/departments', methods=['GET'])
def get_departments():
    # Alphabetical order me sort karke saare departments fetch kar rahe hain
    depts = Department.query.order_by(Department.name.asc()).all()
    return api_response(success=True, data=[d.to_dict() for d in depts])

# Route: Naya department create karna (Admin only)
@academic_bp.route('/departments', methods=['POST'])
@admin_required
def create_department():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    code = data.get('code', '').strip().upper()
    description = data.get('description', '').strip()

    # Required validation
    if not name or not code:
        return error_response("Department name and code are required", status_code=400)

    # Check unique department name ya code
    if Department.query.filter((Department.name == name) | (Department.code == code)).first():
        return error_response("Department with this name or code already exists", status_code=400)

    dept = Department(name=name, code=code, description=description)
    db.session.add(dept)
    db.session.commit()
    # Audit log
    log_audit_action('DEPARTMENT_CREATED', 'department', dept.id, {'name': name, 'code': code})

    return api_response(success=True, message="Department created successfully", data=dept.to_dict(), status_code=201)

# Route: Existing department details update karna (Admin only)
@academic_bp.route('/departments/<int:id>', methods=['PATCH'])
@admin_required
def update_department(id):
    dept = Department.query.get(id)
    if not dept:
        return error_response("Department not found", status_code=404)
    data = request.get_json() or {}
    if 'name' in data:
        dept.name = data['name'].strip()
    if 'code' in data:
        dept.code = data['code'].strip().upper()
    if 'description' in data:
        dept.description = data['description'].strip()
    db.session.commit()
    return api_response(success=True, message="Department updated successfully", data=dept.to_dict())

# Route: Department delete karna (Admin only)
@academic_bp.route('/departments/<int:id>', methods=['DELETE'])
@admin_required
def delete_department(id):
    dept = Department.query.get(id)
    if not dept:
        return error_response("Department not found", status_code=404)
    db.session.delete(dept)
    db.session.commit()
    log_audit_action('DEPARTMENT_DELETED', 'department', id)
    return api_response(success=True, message="Department deleted successfully")


# ----------------- COURSES MANAGEMENT -----------------
# Route: Courses list fetch karna (Optional department filter ke saath)
@academic_bp.route('/courses', methods=['GET'])
def get_courses():
    dept_id = request.args.get('department_id', type=int)
    query = Course.query
    if dept_id:
        query = query.filter_by(department_id=dept_id)
    courses = query.order_by(Course.name.asc()).all()
    return api_response(success=True, data=[c.to_dict() for c in courses])

# Route: Naya Course add karna (Admin only)
@academic_bp.route('/courses', methods=['POST'])
@admin_required
def create_course():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    code = data.get('code', '').strip().upper()
    department_id = data.get('department_id')
    semester_count = data.get('semester_count', 8)
    academic_year = data.get('academic_year', '2024-2025')

    if not name or not code or not department_id:
        return error_response("Name, code, and department are required", status_code=400)

    if Course.query.filter_by(code=code).first():
        return error_response("Course with this code already exists", status_code=400)

    course = Course(
        name=name,
        code=code,
        department_id=department_id,
        semester_count=semester_count,
        academic_year=academic_year
    )
    db.session.add(course)
    db.session.commit()
    log_audit_action('COURSE_CREATED', 'course', course.id, {'name': name, 'code': code})

    return api_response(success=True, message="Course created successfully", data=course.to_dict(), status_code=201)

# Route: Course delete karna (Admin only)
@academic_bp.route('/courses/<int:id>', methods=['DELETE'])
@admin_required
def delete_course(id):
    course = Course.query.get(id)
    if not course:
        return error_response("Course not found", status_code=404)
    db.session.delete(course)
    db.session.commit()
    return api_response(success=True, message="Course deleted successfully")


# ----------------- SUBJECTS MANAGEMENT -----------------
# Route: Subjects list fetch karna (Course aur Semester filtering ke saath)
@academic_bp.route('/subjects', methods=['GET'])
def get_subjects():
    course_id = request.args.get('course_id', type=int)
    semester = request.args.get('semester', type=int)
    query = Subject.query
    if course_id:
        query = query.filter_by(course_id=course_id)
    if semester:
        query = query.filter_by(semester=semester)
    subjects = query.order_by(Subject.semester.asc(), Subject.name.asc()).all()
    return api_response(success=True, data=[s.to_dict() for s in subjects])

# Route: Naya subject syllabus me add karna (Admin only)
@academic_bp.route('/subjects', methods=['POST'])
@admin_required
def create_subject():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    code = data.get('code', '').strip().upper()
    course_id = data.get('course_id')
    semester = data.get('semester')
    credits = data.get('credits', 4)

    if not name or not code or not course_id or not semester:
        return error_response("Name, code, course, and semester are required", status_code=400)

    if Subject.query.filter_by(code=code).first():
        return error_response("Subject with this code already exists", status_code=400)

    subject = Subject(
        name=name,
        code=code,
        course_id=course_id,
        semester=semester,
        credits=credits
    )
    db.session.add(subject)
    db.session.commit()
    log_audit_action('SUBJECT_CREATED', 'subject', subject.id, {'name': name, 'code': code})

    return api_response(success=True, message="Subject created successfully", data=subject.to_dict(), status_code=201)

# Route: Subject delete karna (Admin only)
@academic_bp.route('/subjects/<int:id>', methods=['DELETE'])
@admin_required
def delete_subject(id):
    sub = Subject.query.get(id)
    if not sub:
        return error_response("Subject not found", status_code=404)
    db.session.delete(sub)
    db.session.commit()
    return api_response(success=True, message="Subject deleted successfully")


# ----------------- TEACHER SUBJECT ALLOCATION -----------------
# Route: Teacher aur subject ke allocations fetch karna
@academic_bp.route('/teacher-assignments', methods=['GET'])
@jwt_required()
def get_teacher_assignments():
    teacher_id = request.args.get('teacher_id', type=int)
    academic_year = request.args.get('academic_year', '2024-2025')
    
    query = TeacherSubjectAssignment.query
    if teacher_id:
        query = query.filter_by(teacher_id=teacher_id)
    if academic_year:
        query = query.filter_by(academic_year=academic_year)
        
    assignments = query.all()
    return api_response(success=True, data=[a.to_dict() for a in assignments])

# Route: Teacher ko subject assign karna (Admin only)
@academic_bp.route('/teacher-assignments', methods=['POST'])
@admin_required
def assign_teacher_subject():
    data = request.get_json() or {}
    teacher_id = data.get('teacher_id')
    subject_id = data.get('subject_id')
    academic_year = data.get('academic_year', '2024-2025')
    semester = data.get('semester', 1)

    if not teacher_id or not subject_id:
        return error_response("Teacher and Subject are required", status_code=400)

    existing = TeacherSubjectAssignment.query.filter_by(
        teacher_id=teacher_id,
        subject_id=subject_id,
        academic_year=academic_year
    ).first()
    if existing:
        return error_response("Teacher is already assigned to this subject for the given academic year", status_code=400)

    assignment = TeacherSubjectAssignment(
        teacher_id=teacher_id,
        subject_id=subject_id,
        academic_year=academic_year,
        semester=semester
    )
    db.session.add(assignment)
    db.session.commit()
    log_audit_action('TEACHER_ASSIGNED_SUBJECT', 'teacher_assignment', assignment.id, {'teacher_id': teacher_id, 'subject_id': subject_id})

    return api_response(success=True, message="Teacher assigned to subject successfully", data=assignment.to_dict(), status_code=201)

# Route: Teacher subject allocation remove karna (Admin only)
@academic_bp.route('/teacher-assignments/<int:id>', methods=['DELETE'])
@admin_required
def delete_teacher_assignment(id):
    assignment = TeacherSubjectAssignment.query.get(id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)
    db.session.delete(assignment)
    db.session.commit()
    return api_response(success=True, message="Assignment removed successfully")


# ----------------- STUDENT ENROLLMENTS -----------------
# Route: Student subject enrollments list fetch karna
@academic_bp.route('/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments():
    student_id = request.args.get('student_id', type=int)
    subject_id = request.args.get('subject_id', type=int)
    
    query = Enrollment.query
    if student_id:
        query = query.filter_by(student_id=student_id)
    if subject_id:
        query = query.filter_by(subject_id=subject_id)
        
    enrollments = query.all()
    return api_response(success=True, data=[e.to_dict() for e in enrollments])

# Route: Student ko subject me enroll karna (Admin only)
@academic_bp.route('/enrollments', methods=['POST'])
@admin_required
def enroll_student():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    subject_id = data.get('subject_id')
    academic_year = data.get('academic_year', '2024-2025')
    semester = data.get('semester', 1)

    if not student_id or not subject_id:
        return error_response("Student and Subject are required", status_code=400)

    existing = Enrollment.query.filter_by(
        student_id=student_id,
        subject_id=subject_id,
        academic_year=academic_year
    ).first()
    if existing:
        return error_response("Student already enrolled in this subject for this academic year", status_code=400)

    enrollment = Enrollment(
        student_id=student_id,
        subject_id=subject_id,
        academic_year=academic_year,
        semester=semester,
        status='active'
    )
    db.session.add(enrollment)
    db.session.commit()

    return api_response(success=True, message="Student enrolled successfully", data=enrollment.to_dict(), status_code=201)

# Route: Student enrollment cancel / remove karna (Admin only)
@academic_bp.route('/enrollments/<int:id>', methods=['DELETE'])
@admin_required
def delete_enrollment(id):
    enrollment = Enrollment.query.get(id)
    if not enrollment:
        return error_response("Enrollment not found", status_code=404)
    db.session.delete(enrollment)
    db.session.commit()
    return api_response(success=True, message="Enrollment removed successfully")

