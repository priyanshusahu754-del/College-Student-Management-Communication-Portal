# Flask routing aur HTTP request parsing ke modules
from flask import Blueprint, request
# JWT authentication tokens verify aur user ID nikaalne ke liye
from flask_jwt_extended import jwt_required, get_jwt_identity
# SQLAlchemy database session
from app.extensions import db
# User model
from app.models.user import User
# Academic models
from app.models.academic import Student, Subject, Enrollment
# Examination aur Result models
from app.models.examination import Examination, Result
# Standard JSON responses
from app.utils.responses import api_response, error_response
# Role-based access control decorators
from app.utils.decorators import admin_required, teacher_required, role_required
# Audit trail logger
from app.utils.audit import log_audit_action

# Results aur Examinations API ke liye Blueprint define kar rahe hain
results_bp = Blueprint('results', __name__, url_prefix='/api/v1/results')

# Route: Conducted examinations ki list fetch karna (Academic year aur Semester ke hisab se)
@results_bp.route('/examinations', methods=['GET'])
@jwt_required()
def get_examinations():
    # Query parameters extract kar rahe hain
    academic_year = request.args.get('academic_year')
    semester = request.args.get('semester', type=int)

    # Base query build kar rahe hain
    query = Examination.query
    if academic_year:
        query = query.filter_by(academic_year=academic_year)
    if semester:
        query = query.filter_by(semester=semester)

    # Newest examinations first sort karke list return kar rahe hain
    exams = query.order_by(Examination.created_at.desc()).all()
    return api_response(success=True, data=[e.to_dict() for e in exams])


# Route: Naya examination schedule create karna (Sirf Admin)
@results_bp.route('/examinations', methods=['POST'])
@admin_required
def create_examination():
    # Request data parse kar rahe hain
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    academic_year = data.get('academic_year', '2024-2025')
    semester = data.get('semester', 1)
    exam_type = data.get('exam_type', 'final')

    # Exam title validation
    if not name:
        return error_response("Examination name is required", status_code=400)

    # Naya Examination object create kar rahe hain
    exam = Examination(
        name=name,
        academic_year=academic_year,
        semester=semester,
        exam_type=exam_type
    )
    # Database me add aur commit karte hain
    db.session.add(exam)
    db.session.commit()
    # Audit trail record save kar rahe hain
    log_audit_action('EXAMINATION_CREATED', 'examination', exam.id, {'name': name})

    return api_response(success=True, message="Examination created successfully", data=exam.to_dict(), status_code=201)


# Route: Bulk me students ke exam marks aur grades enter/update karna (Teacher grading portal)
@results_bp.route('/bulk-entry', methods=['POST'])
@teacher_required
def save_bulk_results():
    data = request.get_json() or {}
    examination_id = data.get('examination_id')
    subject_id = data.get('subject_id')
    results_list = data.get('results', [])

    # Validation
    if not examination_id or not subject_id or not isinstance(results_list, list):
        return error_response("examination_id, subject_id, and results array are required", status_code=400)

    exam = Examination.query.get(examination_id)
    subject = Subject.query.get(subject_id)
    if not exam or not subject:
        return error_response("Examination or Subject not found", status_code=404)

    saved_count = 0
    # Har student ke marks process kar rahe hain
    for item in results_list:
        student_id = item.get('student_id')
        marks_obtained = item.get('marks_obtained')
        maximum_marks = item.get('maximum_marks', 100.0)
        remarks = item.get('remarks', '')

        if student_id is None or marks_obtained is None:
            continue

        try:
            marks_obtained = float(marks_obtained)
            maximum_marks = float(maximum_marks)
        except ValueError:
            continue

        # Range validation
        if marks_obtained < 0 or marks_obtained > maximum_marks:
            continue

        # Check existing result record (Upsert)
        res = Result.query.filter_by(
            examination_id=examination_id,
            student_id=student_id,
            subject_id=subject_id
        ).first()

        if res:
            res.marks_obtained = marks_obtained
            res.maximum_marks = maximum_marks
            res.remarks = remarks
            # Automatic grade calculate kar rahe hain (A+, A, B, Fail etc.)
            res.grade = res.calculate_grade()
        else:
            res = Result(
                examination_id=examination_id,
                student_id=student_id,
                subject_id=subject_id,
                marks_obtained=marks_obtained,
                maximum_marks=maximum_marks,
                remarks=remarks
            )
            res.grade = res.calculate_grade()
            db.session.add(res)
        saved_count += 1

    # Database commit
    db.session.commit()
    # Audit log entry
    log_audit_action('RESULTS_ENTERED', 'result_batch', examination_id, {'subject_id': subject_id, 'saved_count': saved_count})

    return api_response(success=True, message=f"Marks saved successfully for {saved_count} students")


# Route: Student ka scorecard / marksheet fetch karna (Exam-wise grouping aur CGPA calculation ke saath)
@results_bp.route('/my-results', methods=['GET'])
@jwt_required()
def get_my_results():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    student = None
    # Agar student login hai toh uska apna profile nikaal rahe hain
    if user.role == 'student':
        student = user.student_profile
        if not student:
            return error_response("Student profile not found", status_code=404)
    else:
        # Teachers aur Admins kisi bhi student ka result dekh sakte hain
        student_id = request.args.get('student_id', type=int)
        if not student_id:
            return error_response("student_id query param is required", status_code=400)
        student = Student.query.get(student_id)
        if not student:
            return error_response("Student not found", status_code=404)

    # Student ke saare result records fetch kar rahe hain
    results = Result.query.filter_by(student_id=student.id).all()

    # Results ko examinations ke hisab se group kar rahe hain
    grouped = {}
    for r in results:
        exam_name = r.examination.name if r.examination else 'General Assessment'
        if exam_name not in grouped:
            grouped[exam_name] = {
                'examination_id': r.examination_id,
                'examination_name': exam_name,
                'semester': r.examination.semester if r.examination else 1,
                'subjects': [],
                'total_obtained': 0.0,
                'total_maximum': 0.0
            }
        r_dict = r.to_dict()
        grouped[exam_name]['subjects'].append(r_dict)
        grouped[exam_name]['total_obtained'] += r.marks_obtained
        grouped[exam_name]['total_maximum'] += r.maximum_marks

    # Har examination ke liye percentage aur CGPA calculate kar rahe hain
    for exam in grouped.values():
        if exam['total_maximum'] > 0:
            exam['overall_percentage'] = round((exam['total_obtained'] / exam['total_maximum']) * 100, 2)
            # Standard 10-point scale CGPA formula: percentage / 9.5
            exam['cgpa'] = round(exam['overall_percentage'] / 9.5, 2)
        else:
            exam['overall_percentage'] = 0.0
            exam['cgpa'] = 0.0

    return api_response(success=True, data=list(grouped.values()))


# Route: Marks entry karne ke liye enrolled students ki table roster fetch karna
@results_bp.route('/subject-roster', methods=['GET'])
@teacher_required
def get_subject_roster_for_marks():
    subject_id = request.args.get('subject_id', type=int)
    examination_id = request.args.get('examination_id', type=int)

    if not subject_id or not examination_id:
        return error_response("subject_id and examination_id are required", status_code=400)

    # Active enrolled students aur existing marks fetch kar rahe hain
    enrollments = Enrollment.query.filter_by(subject_id=subject_id, status='active').all()
    results = Result.query.filter_by(subject_id=subject_id, examination_id=examination_id).all()
    results_map = {r.student_id: r for r in results}

    # Roster list prepare kar rahe hain
    roster = []
    for enr in enrollments:
        student = enr.student
        if not student:
            continue
        existing_res = results_map.get(student.id)
        roster.append({
            'student_id': student.id,
            'student_name': student.user.full_name if student.user else None,
            'enrollment_number': student.enrollment_number,
            'marks_obtained': existing_res.marks_obtained if existing_res else '',
            'maximum_marks': existing_res.maximum_marks if existing_res else 100.0,
            'grade': existing_res.grade if existing_res else '',
            'remarks': existing_res.remarks if existing_res else ''
        })

    return api_response(success=True, data=roster)

