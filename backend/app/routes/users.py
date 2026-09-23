# Flask framework ke Blueprint aur request objects
from flask import Blueprint, request
# JWT authentication functions (Tokens verify aur identity fetch karne ke liye)
from flask_jwt_extended import jwt_required, get_jwt_identity
# SQLAlchemy database session
from app.extensions import db
# User model
from app.models.user import User
# Academic models: Student, Teacher, Department, Course
from app.models.academic import Student, Teacher, Department, Course
# Standardized API response utilities
from app.utils.responses import api_response, error_response
# Access control decorators
from app.utils.decorators import admin_required, role_required
# Audit trail logger
from app.utils.audit import log_audit_action

# User management endpoints ke liye Blueprint create kar rahe hain
users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

# Route: Saare users ki paginated aur filtered list fetch karna (Sirf Admin)
@users_bp.route('', methods=['GET'])
@admin_required
def get_users():
    # Pagination parameters query string se le rahe hain (Default page 1, 10 items per page)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    # Role, Search aur Status filters extract kar rahe hain
    role = request.args.get('role', '').strip().lower()
    search = request.args.get('search', '').strip()
    status = request.args.get('status', '').strip().lower()

    # Base query initialize kar rahe hain
    query = User.query

    # Filters apply kar rahe hain
    if role:
        query = query.filter(User.role == role)
    if status == 'active':
        query = query.filter(User.is_active == True)
    elif status == 'inactive':
        query = query.filter(User.is_active == False)
    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    # Database pagination execute kar rahe hain
    pagination = query.order_by(User.id.desc()).paginate(page=page, per_page=per_page, error_out=False)

    # Users ki dictionary list create kar rahe hain
    users_data = [u.to_dict(include_profile=True) for u in pagination.items]

    # Paginated response metadata ke saath return kar rahe hain
    return api_response(
        success=True,
        data=users_data,
        meta={
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_items': pagination.total,
            'total_pages': pagination.pages
        }
    )


# Route: Naya User create karna aur role ke according student/teacher profile associate karna (Admin only)
@users_bp.route('', methods=['POST'])
@admin_required
def create_user():
    # Request body parse kar rahe hain
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', '').strip().lower()
    phone = data.get('phone', '').strip()

    # Mandatory input validation
    if not full_name or not email or not password or not role:
        return error_response("Full name, email, password, and role are required", status_code=400)

    # Allowed role validation
    if role not in ['admin', 'teacher', 'student']:
        return error_response("Invalid role. Allowed roles: admin, teacher, student", status_code=400)

    # Check unique email constraint
    if User.query.filter_by(email=email).first():
        return error_response("User with this email already exists", status_code=400)

    try:
        # Base User record create kar rahe hain
        user = User(
            full_name=full_name,
            email=email,
            role=role,
            phone=phone
        )
        # Password ka secure bcrypt hash generate karke store karte hain
        user.set_password(password)
        db.session.add(user)
        # Flush karke user ID generate karte hain taaki foreign key me use kar sakein
        db.session.flush()

        # Agar naya user Student hai toh uska Student academic profile create karte hain
        if role == 'student':
            enrollment_number = data.get('enrollment_number', '').strip()
            department_id = data.get('department_id')
            course_id = data.get('course_id')
            current_semester = data.get('current_semester', 1)
            admission_year = data.get('admission_year', 2024)

            if not enrollment_number or not department_id or not course_id:
                db.session.rollback()
                return error_response("Enrollment number, department, and course are required for students", status_code=400)

            if Student.query.filter_by(enrollment_number=enrollment_number).first():
                db.session.rollback()
                return error_response("Student with this enrollment number already exists", status_code=400)

            student = Student(
                user_id=user.id,
                enrollment_number=enrollment_number,
                department_id=department_id,
                course_id=course_id,
                current_semester=current_semester,
                admission_year=admission_year
            )
            db.session.add(student)

        # Agar naya user Teacher hai toh uska Teacher profile create karte hain
        elif role == 'teacher':
            employee_id = data.get('employee_id', '').strip()
            department_id = data.get('department_id')
            designation = data.get('designation', 'Assistant Professor')
            qualification = data.get('qualification', '')

            if not employee_id or not department_id:
                db.session.rollback()
                return error_response("Employee ID and department are required for teachers", status_code=400)

            if Teacher.query.filter_by(employee_id=employee_id).first():
                db.session.rollback()
                return error_response("Teacher with this employee ID already exists", status_code=400)

            teacher = Teacher(
                user_id=user.id,
                employee_id=employee_id,
                department_id=department_id,
                designation=designation,
                qualification=qualification
            )
            db.session.add(teacher)

        # Transaction commit kar rahe hain
        db.session.commit()
        # Audit trail save kar rahe hain
        log_audit_action('USER_CREATED', 'user', user.id, {'email': user.email, 'role': user.role})

        return api_response(
            success=True,
            message="User created successfully",
            data=user.to_dict(include_profile=True),
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create user: {str(e)}", status_code=500)


# Route: ID ke basis par user profile fetch karna (Authorization check ke saath)
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_by_id(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    # Non-admin users sirf apna khud ka record dekh sakte hain
    if current_user.role != 'admin' and current_user_id != user_id:
        return error_response("Access forbidden", status_code=403)

    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    return api_response(success=True, data=user.to_dict(include_profile=True))


# Route: User details aur profile updates save karna
@users_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    # Permission check
    if current_user.role != 'admin' and current_user_id != user_id:
        return error_response("Access forbidden", status_code=403)

    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    data = request.get_json() or {}

    # Common fields update
    if 'full_name' in data:
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']

    # Admin-only privileges: email, semester, department change
    if current_user.role == 'admin':
        if 'email' in data and data['email'] != user.email:
            new_email = data['email'].strip().lower()
            if User.query.filter(User.email == new_email, User.id != user.id).first():
                return error_response("Email already in use by another account", status_code=400)
            user.email = new_email

        if user.role == 'student' and user.student_profile:
            if 'current_semester' in data:
                user.student_profile.current_semester = data['current_semester']
            if 'department_id' in data:
                user.student_profile.department_id = data['department_id']
            if 'course_id' in data:
                user.student_profile.course_id = data['course_id']

        elif user.role == 'teacher' and user.teacher_profile:
            if 'designation' in data:
                user.teacher_profile.designation = data['designation']
            if 'qualification' in data:
                user.teacher_profile.qualification = data['qualification']
            if 'department_id' in data:
                user.teacher_profile.department_id = data['department_id']

    db.session.commit()
    log_audit_action('USER_UPDATED', 'user', user.id, {'email': user.email})

    return api_response(success=True, message="User updated successfully", data=user.to_dict(include_profile=True))


# Route: User account active / deactive toggle karna (Admin only)
@users_bp.route('/<int:user_id>/status', methods=['PATCH'])
@admin_required
def toggle_user_status(user_id):
    current_user_id = int(get_jwt_identity())
    # Admin khud ka account deactivate nahi kar sakta
    if user_id == current_user_id:
        return error_response("Cannot deactivate your own administrator account", status_code=400)

    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    data = request.get_json() or {}
    is_active = data.get('is_active')
    if is_active is None:
        user.is_active = not user.is_active
    else:
        user.is_active = bool(is_active)

    db.session.commit()
    status_str = "activated" if user.is_active else "deactivated"
    # Audit log
    log_audit_action('USER_STATUS_TOGGLED', 'user', user.id, {'status': status_str, 'email': user.email})

    return api_response(success=True, message=f"User account {status_str} successfully", data=user.to_dict(include_profile=True))

