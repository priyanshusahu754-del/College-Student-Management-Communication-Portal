# Timestamps aur dates manipulate karne ke liye datetime module import kar rahe hain
from datetime import datetime
# Flask framework ke routing components
from flask import Blueprint, request
# JWT authentication helpers
from flask_jwt_extended import jwt_required, get_jwt_identity
# SQLAlchemy database session
from app.extensions import db
# User model
from app.models.user import User
# Academic models
from app.models.academic import Student, Teacher, Subject, Enrollment, TeacherSubjectAssignment
# Assignment models
from app.models.assignment import Assignment, AssignmentSubmission
# Standardized JSON response utilities
from app.utils.responses import api_response, error_response
# Role-based access control decorators
from app.utils.decorators import teacher_required, student_required, role_required
# File upload and secure storage handler
from app.utils.file_handler import save_uploaded_file
# Security audit logger
from app.utils.audit import log_audit_action

# Assignments module ke liye Blueprint create kar rahe hain
assignments_bp = Blueprint('assignments', __name__, url_prefix='/api/v1/assignments')

# Route: Assignments ki list fetch karna (Role-based filtering ke saath)
@assignments_bp.route('', methods=['GET'])
@jwt_required()
def get_assignments():
    # Logged-in user ki ID decode kar rahe hain
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    # Optional subject filter query parameter
    subject_id = request.args.get('subject_id', type=int)

    # Base query build kar rahe hain
    query = Assignment.query

    # Agar specific subject manga gaya ho toh filter lagate hain
    if subject_id:
        query = query.filter_by(subject_id=subject_id)

    # Role-based authorization and view scoping
    student_id = None
    if user.role == 'student':
        if user.student_profile:
            student_id = user.student_profile.id
            # Student ko sirf wahi assignments dikhenge jinke subjects me wo enrolled hai aur jo published hain
            enrolled_subjects = [e.subject_id for e in user.student_profile.enrollments]
            query = query.filter(Assignment.subject_id.in_(enrolled_subjects))
            query = query.filter(Assignment.status == 'published')
    elif user.role == 'teacher':
        if user.teacher_profile:
            # Teacher ko unke assigned subjects ke assignments dikhenge
            assigned_subjects = [a.subject_id for a in user.teacher_profile.subject_assignments]
            query = query.filter(Assignment.subject_id.in_(assigned_subjects))

    # Due date ke ascending order me sort karke fetch karte hain
    assignments = query.order_by(Assignment.due_date.asc()).all()
    # Student specific submission details ke saath response return karte hain
    return api_response(success=True, data=[a.to_dict(student_id=student_id) for a in assignments])


# Route: Naya assignment create karna (File attachment support ke saath)
@assignments_bp.route('', methods=['POST'])
@teacher_required
def create_assignment():
    # User identity fetch kar rahe hain
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # Multipart form data (file upload) ya JSON request data handle kar rahe hain
    if request.is_json:
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        subject_id = data.get('subject_id')
        due_date_str = data.get('due_date')
        total_marks = float(data.get('total_marks', 100))
        status = data.get('status', 'published')
        attachment_path = None
        attachment_name = None
    else:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        subject_id = request.form.get('subject_id', type=int)
        due_date_str = request.form.get('due_date')
        total_marks = float(request.form.get('total_marks', 100))
        status = request.form.get('status', 'published')
        
        # Reference document upload check kar rahe hain
        attachment_path = None
        attachment_name = None
        if 'attachment' in request.files:
            file = request.files['attachment']
            if file and file.filename != '':
                attachment_path, attachment_name, _, _ = save_uploaded_file(file, 'assignments')

    # Mandatory input validation
    if not title or not description or not subject_id or not due_date_str:
        return error_response("Title, description, subject, and due date are required", status_code=400)

    # Due date string parse kar rahe hain
    try:
        due_date = datetime.fromisoformat(due_date_str.replace('Z', ''))
    except Exception:
        return error_response("Invalid due date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)", status_code=400)

    teacher_id = user.teacher_profile.id if user.teacher_profile else 1

    # Naya assignment create kar rahe hain
    assignment = Assignment(
        title=title,
        description=description,
        subject_id=subject_id,
        teacher_id=teacher_id,
        due_date=due_date,
        total_marks=total_marks,
        attachment_path=attachment_path,
        attachment_name=attachment_name,
        status=status
    )
    # Database me add aur commit karte hain
    db.session.add(assignment)
    db.session.commit()

    # Audit log entry generate kar rahe hain
    log_audit_action('ASSIGNMENT_CREATED', 'assignment', assignment.id, {'title': title, 'subject_id': subject_id})

    return api_response(success=True, message="Assignment created successfully", data=assignment.to_dict(), status_code=201)


# Route: Ek specific assignment ki details fetch karna
@assignments_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_assignment_detail(id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    # Assignment database se find kar rahe hain
    assignment = Assignment.query.get(id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)

    student_id = user.student_profile.id if user.role == 'student' and user.student_profile else None
    return api_response(success=True, data=assignment.to_dict(student_id=student_id))


# Route: Assignment delete karna (Sirf faculty/admin)
@assignments_bp.route('/<int:id>', methods=['DELETE'])
@teacher_required
def delete_assignment(id):
    assignment = Assignment.query.get(id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)
    # Database se delete kar rahe hain
    db.session.delete(assignment)
    db.session.commit()
    # Audit log entry
    log_audit_action('ASSIGNMENT_DELETED', 'assignment', id)
    return api_response(success=True, message="Assignment deleted successfully")


# Route: Student dwara assignment solution submit karna (File upload ya text submission)
@assignments_bp.route('/<int:id>/submit', methods=['POST'])
@student_required
def submit_assignment(id):
    # Student verify kar rahe hain
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    student = user.student_profile
    if not student:
        return error_response("Student profile not found", status_code=404)

    assignment = Assignment.query.get(id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)

    # Check assignment status
    if assignment.status != 'published':
        return error_response("This assignment is no longer accepting submissions", status_code=400)

    # Check student ne pehle submit kiya hai ya nahi (re-submission support)
    existing_sub = AssignmentSubmission.query.filter_by(
        assignment_id=id,
        student_id=student.id
    ).first()

    submission_text = request.form.get('submission_text', '') if not request.is_json else request.get_json().get('submission_text', '')
    file_path = None
    file_name = None

    # Solution file upload handle kar rahe hain
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename != '':
            try:
                file_path, file_name, _, _ = save_uploaded_file(file, 'submissions')
            except Exception as e:
                return error_response(f"File upload error: {str(e)}", status_code=400)

    if not submission_text and not file_path and not existing_sub:
        return error_response("Please provide submission text or upload a file", status_code=400)

    # Deadline cross hone par late submission mark kar rahe hain
    is_late = datetime.utcnow() > assignment.due_date
    status = 'late' if is_late else 'submitted'

    # Existing submission ko update ya naya submission insert kar rahe hain
    if existing_sub:
        if submission_text:
            existing_sub.submission_text = submission_text
        if file_path:
            existing_sub.file_path = file_path
            existing_sub.file_name = file_name
        existing_sub.submitted_at = datetime.utcnow()
        existing_sub.status = status
        db.session.commit()
        return api_response(success=True, message="Submission updated successfully", data=existing_sub.to_dict())
    else:
        new_sub = AssignmentSubmission(
            assignment_id=id,
            student_id=student.id,
            submission_text=submission_text,
            file_path=file_path,
            file_name=file_name,
            status=status
        )
        db.session.add(new_sub)
        db.session.commit()
        # Audit log entry
        log_audit_action('ASSIGNMENT_SUBMITTED', 'assignment_submission', new_sub.id, {'assignment_id': id, 'is_late': is_late})
        return api_response(success=True, message="Assignment submitted successfully", data=new_sub.to_dict(), status_code=201)


# Route: Ek assignment ke saare student submissions fetch karna (Faculty grading view)
@assignments_bp.route('/<int:id>/submissions', methods=['GET'])
@teacher_required
def get_assignment_submissions(id):
    assignment = Assignment.query.get(id)
    if not assignment:
        return error_response("Assignment not found", status_code=404)

    submissions = AssignmentSubmission.query.filter_by(assignment_id=id).order_by(AssignmentSubmission.submitted_at.desc()).all()
    return api_response(success=True, data=[s.to_dict() for s in submissions])


# Route: Submission ko evaluate karke marks aur feedback dena (Teacher grading)
@assignments_bp.route('/submissions/<int:submission_id>/grade', methods=['PATCH'])
@teacher_required
def grade_submission(submission_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    submission = AssignmentSubmission.query.get(submission_id)
    if not submission:
        return error_response("Submission not found", status_code=404)

    data = request.get_json() or {}
    marks = data.get('marks')
    feedback = data.get('feedback', '').strip()

    if marks is None:
        return error_response("Marks are required", status_code=400)

    # Number validation
    try:
        marks = float(marks)
    except ValueError:
        return error_response("Marks must be a valid number", status_code=400)

    # Maximum marks bound checking
    if marks < 0 or marks > submission.assignment.total_marks:
        return error_response(f"Marks must be between 0 and {submission.assignment.total_marks}", status_code=400)

    # Grading update kar rahe hain
    submission.marks = marks
    submission.feedback = feedback
    submission.status = 'graded'
    submission.graded_at = datetime.utcnow()
    submission.graded_by_id = user.teacher_profile.id if user.teacher_profile else None

    # Database commit
    db.session.commit()
    # Audit log entry
    log_audit_action('SUBMISSION_GRADED', 'assignment_submission', submission.id, {'marks': marks})

    return api_response(success=True, message="Submission graded successfully", data=submission.to_dict())


# Route: Logged-in student ke saare submissions ki list dekhne ke liye
@assignments_bp.route('/my-submissions', methods=['GET'])
@student_required
def get_my_submissions():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    student = user.student_profile
    if not student:
        return error_response("Student profile not found", status_code=404)

    submissions = AssignmentSubmission.query.filter_by(student_id=student.id).order_by(AssignmentSubmission.submitted_at.desc()).all()
    return api_response(success=True, data=[s.to_dict() for s in submissions])

