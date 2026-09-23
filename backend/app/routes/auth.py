# Flask framework se Blueprint aur request object ko import kar rahe hai
from flask import Blueprint, request
# Flask-JWT-Extended se JWT token create karne, token verify karne aur user identity nikalne wale functions
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
# SQLAlchemy database instance import kar rahe hai
from app.extensions import db
# User model database table se interact karne ke liye
from app.models.user import User
# Standard API JSON responses ke helpers
from app.utils.responses import api_response, error_response
# Security aur auditing ke liye action log karne wala function
from app.utils.audit import log_audit_action

# Authentication routes ke liye Blueprint initialize kiya jiska URL prefix '/api/v1/auth' hai
auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

# ==================== 1. USER LOGIN ENDPOINT ====================
# Yeh POST route login credentials (email & password) verify karke JWT access token return karta hai
@auth_bp.route('/login', methods=['POST'])
def login():
    # Frontend se aane wala JSON payload extract karte hai
    data = request.get_json() or {}
    # Email extract karke lowercase aur trim (spaces remove) karte hai
    email = data.get('email', '').strip().lower()
    # Password string extract karte hai
    password = data.get('password', '')

    # Check karte hai ki email aur password empty toh nahi hai
    if not email or not password:
        return error_response("Email and password are required", status_code=400)

    # Database me user ko email se search karte hai
    user = User.query.filter_by(email=email).first()
    # User exist karta hai ya nahi aur password hash match karta hai ya nahi yeh verify karte hai
    if not user or not user.check_password(password):
        return error_response("Invalid email or password", status_code=401)

    # Check karte hai ki account active hai ya administrator ne deactivate kiya hua hai
    if not user.is_active:
        return error_response("Account is deactivated. Please contact your college administrator.", status_code=403)

    # User ID ko string bana kar 24-hour validity wala JWT token generate karte hai
    access_token = create_access_token(identity=str(user.id))

    # Successful login event ko security audit logs table me save karte hai
    log_audit_action('USER_LOGIN', 'user', user.id, {'email': user.email, 'role': user.role}, actor_user_id=user.id)

    # Frontend ko JWT token aur complete user profile dictionary format me return karte hai
    return api_response(
        success=True,
        message="Login successful",
        data={
            'access_token': access_token,
            'user': user.to_dict(include_profile=True)
        }
    )


# ==================== 2. GET CURRENT LOGGED-IN USER PROFILE ====================
# Yeh GET route token verify karke currently logged-in user ka profile data return karta hai
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    # Token me se user ID extract karte hai
    user_id = int(get_jwt_identity())
    # Database se user fetch karte hai
    user = User.query.get(user_id)
    # Agar user nahi mila toh 404 Not Found bhejenge
    if not user:
        return error_response("User not found", status_code=404)
    # Agar account inactive hai toh 403 bhejenge
    if not user.is_active:
        return error_response("Account is deactivated", status_code=403)

    # User ka profile return karte hai
    return api_response(
        success=True,
        data={'user': user.to_dict(include_profile=True)}
    )


# ==================== 3. CHANGE PASSWORD ENDPOINT ====================
# Logged-in user apna password securely change kar sakta hai
@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    # Authenticated user ID get karte hai
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    # Request se old aur new password lete hai
    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    # Validations check
    if not old_password or not new_password:
        return error_response("Current password and new password are required", status_code=400)

    # Minimum length validation
    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters long", status_code=400)

    # Old password match check
    if not user.check_password(old_password):
        return error_response("Current password is incorrect", status_code=400)

    # New password ka hash generate karke save karte hai
    user.set_password(new_password)
    # Database transaction commit karte hai
    db.session.commit()

    # Password change event audit log me record karte hai
    log_audit_action('PASSWORD_CHANGED', 'user', user.id, {'email': user.email}, actor_user_id=user.id)

    return api_response(success=True, message="Password updated successfully")


# ==================== 4. LOGOUT ENDPOINT ====================
# Logout audit event record karne ke liye
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = int(get_jwt_identity())
    # Audit log me record add karte hai
    log_audit_action('USER_LOGOUT', 'user', user_id, actor_user_id=user_id)
    return api_response(success=True, message="Logged out successfully")
