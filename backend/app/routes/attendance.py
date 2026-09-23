# Python ke date aur datetime data types import kar rahe hain
from datetime import datetime, date
# Flask framework ke Blueprint aur request objects import kar rahe hain
from flask import Blueprint, request
# JWT authentication tokens verify aur decode karne ke functions
from flask_jwt_extended import jwt_required, get_jwt_identity
# SQLAlchemy database session
from app.extensions import db
# User model
from app.models.user import User
# Academic models
from app.models.academic import Student, Teacher, Subject, Enrollment, TeacherSubjectAssignment
# Attendance models
from app.models.attendance import AttendanceSession, AttendanceRecord
# Standardized JSON response helpers
from app.utils.responses import api_response, error_response
# Role-based access control decorators
from app.utils.decorators import teacher_required, role_required
# Security audit logging function
from app.utils.audit import log_audit_action

# Attendance management ke liye Flask Blueprint create kar rahe hain
attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/v1/attendance')

# Route: Naya attendance session create karne ya existing open karne ke liye
@attendance_bp.route('/sessions', methods=['POST'])
@teacher_required  # Sirf Teachers ya Admins access kar sakte hain
def create_session():
    # Token se authenticated user ID nikaal rahe hain
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    # Request JSON payload extract kar rahe hain
    data = request.get_json() or {}

    # Required fields extract kar rahe hain
    subject_id = data.get('subject_id')
    session_date_str = data.get('session_date')
    start_time = data.get('start_time', '10:00 AM')
    topic = data.get('topic', '').strip()

    # Validation: Subject ID aur date mandatory hain
    if not subject_id or not session_date_str:
        return error_response("Subject and session date are required", status_code=400)

    # Date string ko validate aur parse kar rahe hain
    try:
        session_date = datetime.strptime(session_date_str, '%Y-%m-%d').date()
    except ValueError:
        return error_response("Invalid date format. Use YYYY-MM-DD", status_code=400)

    # Agar user Teacher hai toh verify kar rahe hain ki kya teacher iss subject ke liye assigned hai
    teacher_id = None
    if user.role == 'teacher':
        if not user.teacher_profile:
            return error_response("Teacher profile not configured", status_code=400)
        teacher_id = user.teacher_profile.id
        is_assigned = TeacherSubjectAssignment.query.filter_by(
            teacher_id=teacher_id,
            subject_id=subject_id
        ).first()
        if not is_assigned:
            return error_response("You are not authorized to manage attendance for this subject", status_code=403)
    elif user.role == 'admin':
        teacher_id = data.get('teacher_id')

    # Check kar rahe hain ki kya same date aur subject ke liye pehle se session bana hua hai
    existing_session = AttendanceSession.query.filter_by(
        subject_id=subject_id,
        session_date=session_date
    ).first()

    # Agar session pehle se bana hua hai toh wahi return kar dete hain taaki teacher update kar sake
    if existing_session:
        return api_response(
            success=True,
            message="Found existing session for this date",
            data=existing_session.to_dict(include_records=True),
            status_code=200
        )

    # Naya AttendanceSession object create kar rahe hain
    session = AttendanceSession(
        subject_id=subject_id,
        teacher_id=teacher_id,
        session_date=session_date,
        start_time=start_time,
        topic=topic
    )
    # Database me save kar rahe hain
    db.session.add(session)
    db.session.commit()

    # Audit log entry create kar rahe hain
    log_audit_action('ATTENDANCE_SESSION_CREATED', 'attendance_session', session.id, {
        'subject_id': subject_id,
        'date': session_date_str
    })

    # Success response return kar rahe hain
    return api_response(
        success=True,
        message="Attendance session created successfully",
        data=session.to_dict(),
        status_code=201
    )


# Route: Kisi subject ke saare attendance sessions ki list fetch karne ke liye
@attendance_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    # Query param se subject_id le rahe hain
    subject_id = request.args.get('subject_id', type=int)
    if not subject_id:
        return error_response("subject_id is required", status_code=400)

    # Sessions ko date ke descending order me fetch kar rahe hain
    sessions = AttendanceSession.query.filter_by(subject_id=subject_id).order_by(AttendanceSession.session_date.desc()).all()
    return api_response(success=True, data=[s.to_dict() for s in sessions])


# Route: Ek specific session ki complete student roster aur marked attendance records fetch karne ke liye
@attendance_bp.route('/session/<int:session_id>', methods=['GET'])
@jwt_required()
def get_session_details(session_id):
    # Session fetch kar rahe hain
    session = AttendanceSession.query.get(session_id)
    if not session:
        return error_response("Session not found", status_code=404)

    # Subject me active enrolled students ki list nikaal rahe hain
    enrollments = Enrollment.query.filter_by(subject_id=session.subject_id, status='active').all()
    # Existing marked records ko dictionary map me store kar rahe hain
    records_by_student = {r.student_id: r.to_dict() for r in session.records}

    # Student roster list tayyar kar rahe hain marking UI ke liye
    roster = []
    for enr in enrollments:
        student = enr.student
        if not student:
            continue
        record = records_by_student.get(student.id)
        roster.append({
            'student_id': student.id,
            'student_name': student.user.full_name if student.user else None,
            'enrollment_number': student.enrollment_number,
            'status': record['status'] if record else 'present',  # Default status present set kiya hai
            'remarks': record['remarks'] if record else ''
        })

    # Response payload prepare kar rahe hain
    data = session.to_dict()
    data['roster'] = roster
    return api_response(success=True, data=data)


# Route: Bulk me students ke attendance records (Present/Absent/Late) save karne ke liye
@attendance_bp.route('/records', methods=['POST'])
@teacher_required
def save_attendance_records():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    records_data = data.get('records', [])

    # Validation
    if not session_id or not isinstance(records_data, list):
        return error_response("session_id and records array are required", status_code=400)

    # Session exist karta hai ya nahi check kar rahe hain
    session = AttendanceSession.query.get(session_id)
    if not session:
        return error_response("Attendance session not found", status_code=404)

    # Har student ke record ko update ya insert (Upsert) kar rahe hain
    saved_count = 0
    for item in records_data:
        student_id = item.get('student_id')
        status = item.get('status', 'present').lower()
        remarks = item.get('remarks', '')

        if not student_id or status not in ['present', 'absent', 'late', 'excused']:
            continue

        # Check existing record
        existing_record = AttendanceRecord.query.filter_by(
            session_id=session_id,
            student_id=student_id
        ).first()

        if existing_record:
            existing_record.status = status
            existing_record.remarks = remarks
            existing_record.updated_at = datetime.utcnow()
        else:
            new_record = AttendanceRecord(
                session_id=session_id,
                student_id=student_id,
                status=status,
                remarks=remarks
            )
            db.session.add(new_record)
        saved_count += 1

    # Database commit
    db.session.commit()
    # Audit log entry
    log_audit_action('ATTENDANCE_MARKED', 'attendance_session', session_id, {'records_saved': saved_count})

    return api_response(
        success=True,
        message=f"Attendance saved successfully for {saved_count} students"
    )


# Route: Student ka comprehensive attendance analytics aur subject-wise percentage nikaalne ke liye
@attendance_bp.route('/student-summary', methods=['GET'])
@jwt_required()
def get_student_attendance_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    student = None
    # Agar student khud login hai toh uska profile fetch karte hain
    if user.role == 'student':
        student = user.student_profile
        if not student:
            return error_response("Student profile not found", status_code=404)
    else:
        # Teachers aur Admins query param me student_id bhej sakte hain
        student_id = request.args.get('student_id', type=int)
        if not student_id:
            return error_response("student_id query param required for non-students", status_code=400)
        student = Student.query.get(student_id)
        if not student:
            return error_response("Student not found", status_code=404)

    # Student ke saare enrolled active subjects fetch kar rahe hain
    enrollments = Enrollment.query.filter_by(student_id=student.id, status='active').all()
    
    subject_summaries = []
    total_all_sessions = 0
    total_all_present = 0

    # Har subject ke liye statistics calculate kar rahe hain
    for enr in enrollments:
        subject = enr.subject
        if not subject:
            continue

        # Subject me total kitne lectures hue
        sessions = AttendanceSession.query.filter_by(subject_id=subject.id).all()
        session_ids = [s.id for s in sessions]
        total_sessions = len(session_ids)

        if total_sessions == 0:
            subject_summaries.append({
                'subject_id': subject.id,
                'subject_name': subject.name,
                'subject_code': subject.code,
                'total_sessions': 0,
                'present_count': 0,
                'absent_count': 0,
                'late_count': 0,
                'excused_count': 0,
                'percentage': 100.0,
                'status_warning': False
            })
            continue

        # Student ke marked attendance records fetch kar rahe hain
        records = AttendanceRecord.query.filter(
            AttendanceRecord.session_id.in_(session_ids),
            AttendanceRecord.student_id == student.id
        ).all()

        present_count = sum(1 for r in records if r.status == 'present')
        late_count = sum(1 for r in records if r.status == 'late')
        excused_count = sum(1 for r in records if r.status == 'excused')
        absent_count = sum(1 for r in records if r.status == 'absent')
        
        # Policy: Present, Excused aur Late classes count hoti hain
        attended = present_count + excused_count + late_count
        # Percentage calculate kar rahe hain
        percentage = round((attended / total_sessions) * 100, 1)

        total_all_sessions += total_sessions
        total_all_present += attended

        # Subject summary list me append kar rahe hain
        subject_summaries.append({
            'subject_id': subject.id,
            'subject_name': subject.name,
            'subject_code': subject.code,
            'total_sessions': total_sessions,
            'present_count': present_count,
            'absent_count': absent_count,
            'late_count': late_count,
            'excused_count': excused_count,
            'percentage': percentage,
            # 75% se kam attendance hone par low attendance warning flag
            'status_warning': percentage < 75.0
        })

    # Overall percentage across all subjects calculate kar rahe hain
    overall_percentage = round((total_all_present / total_all_sessions) * 100, 1) if total_all_sessions > 0 else 100.0

    # Student ke recent 20 attendance log records fetch kar rahe hain
    recent_records = AttendanceRecord.query.filter_by(student_id=student.id).order_by(AttendanceRecord.marked_at.desc()).limit(20).all()

    # Final summary response return kar rahe hain
    return api_response(
        success=True,
        data={
            'overall_percentage': overall_percentage,
            'total_sessions': total_all_sessions,
            'total_attended': total_all_present,
            'is_critical': overall_percentage < 75.0,
            'subject_summaries': subject_summaries,
            'recent_records': [r.to_dict() for r in recent_records]
        }
    )

