# Python ka standard library se wraps import kar rahe hai taaki original function ka metadata preserve rahe
from functools import wraps
# Flask-JWT-Extended se JWT verify karne aur logged-in user ki identity lene wale functions import kar rahe hai
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
# Database se user details check karne ke liye User model import kar rahe hai
from app.models.user import User
# Standard error response format return karne ke liye helper function import kar rahe hai
from app.utils.responses import error_response

# Yeh main Role-Based Access Control (RBAC) decorator function hai
def role_required(allowed_roles):
    """
    Yeh decorator check karta hai ki user logged-in hai, account active hai,
    aur uske paas required role (Admin, Teacher ya Student) hai ya nahi.
    """
    # Agar allowed_roles single string hai jaise 'admin', toh usko list me convert kar lete hai
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    # Decorator function definition
    def decorator(fn):
        # Original function ke name aur docstring ko preserve karne ke liye wraps use kiya
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Request me JWT token present aur valid hai ya nahi yeh verify karta hai
            verify_jwt_in_request()
            # Token me se user ki identity (User ID) nikalte hai
            user_id = get_jwt_identity()
            
            # User ID ko integer me convert karte hai
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                # Agar user_id valid number nahi hai toh 401 Unauthorized return karenge
                return error_response("Invalid token identity", status_code=401)

            # Database se user ka record fetch karte hai
            user = User.query.get(user_id)
            # Agar database me user nahi mila toh 401 error bhejenge
            if not user:
                return error_response("User not found or session invalid", status_code=401)
            
            # Agar user account admin ne deactivate kar diya hai toh 403 Forbidden return karenge
            if not user.is_active:
                return error_response("Account has been deactivated. Please contact administrator.", status_code=403)

            # Agar user ka role allowed_roles list me nahi hai toh unauthorized access reject karenge
            if user.role not in allowed_roles:
                return error_response(f"Access forbidden: requires {', '.join(allowed_roles)} role", status_code=403)

            # Saari security checks pass hone par original API route function execute hoga
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# Admin-only access ke liye shortcut decorator
def admin_required(fn):
    # Sirf 'admin' role wale users ko allow karega
    return role_required(['admin'])(fn)


# Faculty/Teacher access ke liye shortcut decorator (Admin ko bhi access milta hai)
def teacher_required(fn):
    # 'teacher' aur 'admin' roles ko allow karega
    return role_required(['teacher', 'admin'])(fn)


# Student access ke liye shortcut decorator
def student_required(fn):
    # Sirf 'student' role wale users ko allow karega
    return role_required(['student'])(fn)
