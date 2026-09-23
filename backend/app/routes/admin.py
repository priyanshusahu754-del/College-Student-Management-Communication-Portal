from flask import Blueprint, request
from app.extensions import db
from app.models.user import User
from app.models.academic import Student, Teacher, Department, Course, Subject, Enrollment
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.communication import Notice, Event
from app.models.system import AuditLog
from app.utils.responses import api_response, error_response
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/v1/admin')

@admin_bp.route('/analytics/overview', methods=['GET'])
@admin_required
def get_analytics_overview():
    total_students = Student.query.count()
    total_teachers = Teacher.query.count()
    total_departments = Department.query.count()
    total_courses = Course.query.count()
    total_subjects = Subject.query.count()
    total_assignments = Assignment.query.count()
    total_notices = Notice.query.filter_by(is_active=True).count()
    total_events = Event.query.count()
    active_users = User.query.filter_by(is_active=True).count()

    # Department student distribution
    depts = Department.query.all()
    dept_distribution = []
    for d in depts:
        dept_distribution.append({
            'department_name': d.name,
            'department_code': d.code,
            'student_count': len(d.students) if d.students else 0,
            'teacher_count': len(d.teachers) if d.teachers else 0
        })

    # Attendance overall rate
    total_attendance_records = AttendanceRecord.query.count()
    present_records = AttendanceRecord.query.filter(AttendanceRecord.status.in_(['present', 'excused', 'late'])).count()
    avg_attendance_rate = round((present_records / total_attendance_records) * 100, 1) if total_attendance_records > 0 else 0.0

    # Submissions stats
    total_submissions = AssignmentSubmission.query.count()
    graded_submissions = AssignmentSubmission.query.filter_by(status='graded').count()
    pending_submissions = AssignmentSubmission.query.filter(AssignmentSubmission.status.in_(['submitted', 'late'])).count()

    # User breakdown
    users_by_role = {
        'students': total_students,
        'teachers': total_teachers,
        'admins': User.query.filter_by(role='admin').count()
    }

    return api_response(
        success=True,
        data={
            'totals': {
                'students': total_students,
                'teachers': total_teachers,
                'departments': total_departments,
                'courses': total_courses,
                'subjects': total_subjects,
                'assignments': total_assignments,
                'notices': total_notices,
                'events': total_events,
                'active_users': active_users,
                'avg_attendance_rate': avg_attendance_rate
            },
            'department_distribution': dept_distribution,
            'users_by_role': users_by_role,
            'submissions_stats': {
                'total': total_submissions,
                'graded': graded_submissions,
                'pending': pending_submissions
            }
        }
    )


@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    action = request.args.get('action', '').strip()
    entity_type = request.args.get('entity_type', '').strip()

    query = AuditLog.query

    if action:
        query = query.filter(AuditLog.action.ilike(f'%{action}%'))
    if entity_type:
        query = query.filter_by(entity_type=entity_type)

    pagination = query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(
        success=True,
        data=[l.to_dict() for l in pagination.items],
        meta={
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_items': pagination.total,
            'total_pages': pagination.pages
        }
    )
