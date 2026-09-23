from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.system import Notification
from app.utils.responses import api_response, error_response

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/v1/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(recipient_user_id=user_id).order_by(Notification.created_at.desc()).limit(30).all()
    
    unread_count = Notification.query.filter_by(recipient_user_id=user_id, is_read=False).count()

    return api_response(
        success=True,
        data=[n.to_dict() for n in notifications],
        meta={'unread_count': unread_count}
    )


@notifications_bp.route('/<int:id>/read', methods=['PATCH'])
@jwt_required()
def mark_as_read(id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(id=id, recipient_user_id=user_id).first()
    if not notification:
        return error_response("Notification not found", status_code=404)

    notification.is_read = True
    db.session.commit()

    return api_response(success=True, message="Marked as read", data=notification.to_dict())


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_as_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(recipient_user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()

    return api_response(success=True, message="All notifications marked as read")
