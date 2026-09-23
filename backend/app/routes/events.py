from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.academic import Student
from app.models.communication import Event, EventRegistration
from app.utils.responses import api_response, error_response
from app.utils.decorators import admin_required, student_required
from app.utils.audit import log_audit_action

events_bp = Blueprint('events', __name__, url_prefix='/api/v1/events')

@events_bp.route('', methods=['GET'])
@jwt_required()
def get_events():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    student_id = user.student_profile.id if user.role == 'student' and user.student_profile else None

    status = request.args.get('status')
    query = Event.query

    if status:
        query = query.filter_by(status=status)

    events = query.order_by(Event.start_datetime.asc()).all()
    return api_response(success=True, data=[e.to_dict(student_id=student_id) for e in events])


@events_bp.route('', methods=['POST'])
@admin_required
def create_event():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    venue = data.get('venue', '').strip()
    start_str = data.get('start_datetime')
    end_str = data.get('end_datetime')
    capacity = int(data.get('capacity', 100))
    image_url = data.get('image_url', '')

    if not title or not description or not venue or not start_str or not end_str:
        return error_response("Title, description, venue, and start/end dates are required", status_code=400)

    try:
        start_datetime = datetime.fromisoformat(start_str.replace('Z', ''))
        end_datetime = datetime.fromisoformat(end_str.replace('Z', ''))
    except Exception:
        return error_response("Invalid datetime format. Use ISO format (YYYY-MM-DDTHH:MM:SS)", status_code=400)

    event = Event(
        title=title,
        description=description,
        venue=venue,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        organizer_id=user_id,
        capacity=capacity,
        image_url=image_url,
        status='upcoming'
    )
    db.session.add(event)
    db.session.commit()

    log_audit_action('EVENT_CREATED', 'event', event.id, {'title': title, 'venue': venue})

    return api_response(success=True, message="Event created successfully", data=event.to_dict(), status_code=201)


@events_bp.route('/<int:id>', methods=['PATCH'])
@admin_required
def update_event(id):
    event = Event.query.get(id)
    if not event:
        return error_response("Event not found", status_code=404)

    data = request.get_json() or {}
    if 'title' in data:
        event.title = data['title'].strip()
    if 'description' in data:
        event.description = data['description'].strip()
    if 'venue' in data:
        event.venue = data['venue'].strip()
    if 'capacity' in data:
        event.capacity = int(data['capacity'])
    if 'status' in data:
        event.status = data['status'].lower()
    if 'image_url' in data:
        event.image_url = data['image_url']

    db.session.commit()
    log_audit_action('EVENT_UPDATED', 'event', event.id, {'title': event.title})

    return api_response(success=True, message="Event updated successfully", data=event.to_dict())


@events_bp.route('/<int:id>/register', methods=['POST'])
@student_required
def register_for_event(id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    student = user.student_profile
    if not student:
        return error_response("Student profile not found", status_code=404)

    event = Event.query.get(id)
    if not event:
        return error_response("Event not found", status_code=404)

    if event.status != 'upcoming':
        return error_response("Registrations are closed for this event", status_code=400)

    # Check duplicate registration
    existing_reg = EventRegistration.query.filter_by(event_id=id, student_id=student.id).first()
    if existing_reg:
        if existing_reg.status == 'cancelled':
            existing_reg.status = 'registered'
            existing_reg.registered_at = datetime.utcnow()
            db.session.commit()
            return api_response(success=True, message="Registration re-activated successfully", data=existing_reg.to_dict())
        return error_response("You are already registered for this event", status_code=400)

    # Check capacity limit
    current_count = EventRegistration.query.filter_by(event_id=id, status='registered').count()
    if event.capacity and current_count >= event.capacity:
        return error_response("Event has reached maximum capacity", status_code=400)

    registration = EventRegistration(
        event_id=id,
        student_id=student.id,
        status='registered'
    )
    db.session.add(registration)
    db.session.commit()

    log_audit_action('EVENT_REGISTERED', 'event_registration', registration.id, {'event_id': id, 'student_id': student.id})

    return api_response(success=True, message="Successfully registered for event", data=registration.to_dict(), status_code=201)


@events_bp.route('/<int:id>/cancel', methods=['POST'])
@student_required
def cancel_registration(id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    student = user.student_profile

    registration = EventRegistration.query.filter_by(event_id=id, student_id=student.id).first()
    if not registration or registration.status == 'cancelled':
        return error_response("No active registration found for this event", status_code=404)

    registration.status = 'cancelled'
    db.session.commit()

    log_audit_action('EVENT_REGISTRATION_CANCELLED', 'event_registration', registration.id, {'event_id': id})

    return api_response(success=True, message="Event registration cancelled successfully")


@events_bp.route('/<int:id>/registrations', methods=['GET'])
@admin_required
def get_event_registrations(id):
    event = Event.query.get(id)
    if not event:
        return error_response("Event not found", status_code=404)

    registrations = EventRegistration.query.filter_by(event_id=id, status='registered').all()
    return api_response(success=True, data=[r.to_dict() for r in registrations])
