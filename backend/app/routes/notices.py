from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.communication import Notice
from app.models.system import Notification
from app.utils.responses import api_response, error_response
from app.utils.decorators import role_required
from app.utils.audit import log_audit_action

notices_bp = Blueprint('notices', __name__, url_prefix='/api/v1/notices')

@notices_bp.route('', methods=['GET'])
@jwt_required()
def get_notices():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    priority = request.args.get('priority')
    search = request.args.get('search', '').strip()

    query = Notice.query.filter_by(is_active=True)

    if user.role == 'student':
        dept_id = user.student_profile.department_id if user.student_profile else None
        query = query.filter(
            (Notice.audience.in_(['all', 'students'])) |
            ((Notice.audience == 'department') & (Notice.target_department_id == dept_id))
        )
    elif user.role == 'teacher':
        dept_id = user.teacher_profile.department_id if user.teacher_profile else None
        query = query.filter(
            (Notice.audience.in_(['all', 'teachers'])) |
            ((Notice.audience == 'department') & (Notice.target_department_id == dept_id))
        )
    # Admin sees all notices

    if priority:
        query = query.filter_by(priority=priority)
    if search:
        query = query.filter(
            (Notice.title.ilike(f'%{search}%')) |
            (Notice.content.ilike(f'%{search}%'))
        )

    notices = query.order_by(Notice.priority.desc(), Notice.published_at.desc()).all()
    return api_response(success=True, data=[n.to_dict() for n in notices])


@notices_bp.route('', methods=['POST'])
@role_required(['admin', 'teacher'])
def create_notice():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    audience = data.get('audience', 'all').lower()
    target_department_id = data.get('target_department_id')
    priority = data.get('priority', 'medium').lower()
    expires_at_str = data.get('expires_at')

    if not title or not content:
        return error_response("Title and content are required", status_code=400)

    expires_at = None
    if expires_at_str:
        try:
            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', ''))
        except Exception:
            pass

    notice = Notice(
        title=title,
        content=content,
        created_by=user_id,
        audience=audience,
        target_department_id=target_department_id,
        priority=priority,
        expires_at=expires_at,
        is_active=True
    )
    db.session.add(notice)
    db.session.commit()

    log_audit_action('NOTICE_PUBLISHED', 'notice', notice.id, {'title': title, 'priority': priority})

    return api_response(success=True, message="Notice published successfully", data=notice.to_dict(), status_code=201)


@notices_bp.route('/<int:id>', methods=['PATCH'])
@role_required(['admin', 'teacher'])
def update_notice(id):
    notice = Notice.query.get(id)
    if not notice:
        return error_response("Notice not found", status_code=404)

    data = request.get_json() or {}
    if 'title' in data:
        notice.title = data['title'].strip()
    if 'content' in data:
        notice.content = data['content'].strip()
    if 'audience' in data:
        notice.audience = data['audience'].lower()
    if 'priority' in data:
        notice.priority = data['priority'].lower()
    if 'is_active' in data:
        notice.is_active = bool(data['is_active'])

    db.session.commit()
    log_audit_action('NOTICE_UPDATED', 'notice', notice.id, {'title': notice.title})

    return api_response(success=True, message="Notice updated successfully", data=notice.to_dict())


@notices_bp.route('/<int:id>', methods=['DELETE'])
@role_required(['admin', 'teacher'])
def delete_notice(id):
    notice = Notice.query.get(id)
    if not notice:
        return error_response("Notice not found", status_code=404)
    db.session.delete(notice)
    db.session.commit()
    log_audit_action('NOTICE_DELETED', 'notice', id)
    return api_response(success=True, message="Notice deleted successfully")
