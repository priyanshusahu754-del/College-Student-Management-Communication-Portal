# Operating system interactions aur directory creation ke liye os module import kar rahe hain
import os
# Flask web framework class aur json responses bhejne ke liye jsonify import kar rahe hain
from flask import Flask, jsonify
# Configurations dictionary (dev, prod, test) import kar rahe hain
from app.config import config_by_name
# Database, migrations, JWT authentication aur CORS extensions import kar rahe hain
from app.extensions import db, migrate, jwt, cors
# Standardized error response helper function import kar rahe hain
from app.utils.responses import error_response

# Application Factory pattern: Flask app instance ko configure aur initialize karne ka main function
def create_app(config_name='development'):
    # Flask application ka primary instance create kar rahe hain
    app = Flask(__name__)
    
    # Selected environment (development, production, testing) ki configuration load kar rahe hain
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))
    
    # Assignments aur study materials upload karne ke liye directory exist karti hai ya nahi check karke create kar rahe hain
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    
    # SQLAlchemy ORM database extension ko Flask app ke saath bind kar rahe hain
    db.init_app(app)
    # Flask-Migrate database migration engine ko bind kar rahe hain
    migrate.init_app(app, db)
    # Flask-JWT-Extended authentication manager ko initialize kar rahe hain
    jwt.init_app(app)
    # Cross-Origin Resource Sharing (CORS) enable kar rahe hain taaki React frontend API call kar sake
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Saare API module routes (Blueprints) ko import kar rahe hain
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.academic import academic_bp
    from app.routes.attendance import attendance_bp
    from app.routes.assignments import assignments_bp
    from app.routes.materials import materials_bp
    from app.routes.notices import notices_bp
    from app.routes.events import events_bp
    from app.routes.results import results_bp
    from app.routes.notifications import notifications_bp
    from app.routes.admin import admin_bp
    from app.routes.health import health_bp
    
    # Blueprints ko main Flask app me register kar rahe hain alag alag URL endpoints handle karne ke liye
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(academic_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(materials_bp)
    app.register_blueprint(notices_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(results_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(health_bp)

    # Jab request me JWT token missing ya unauthorized ho tab ye custom error handler execute hota hai
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        # 401 Unauthorized status code ke saath JSON message return kar rahe hain
        return error_response("Missing or invalid authorization token", status_code=401)

    # Jab request me provide kiya gaya JWT token invalid ya corrupt ho
    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        # 401 Invalid Token status return kar rahe hain
        return error_response("Invalid authentication token", status_code=401)

    # Jab JWT token expire ho chuka ho tab user ko logout karke re-login karne ka response bhejte hain
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        # 401 Token Expired message return kar rahe hain
        return error_response("Authentication token has expired. Please login again.", status_code=401)

    # Global 404 handler: Agar requested URL exist nahi karti
    @app.errorhandler(404)
    def not_found(e):
        # 404 Not Found error return kar rahe hain
        return error_response("Resource not found", status_code=404)

    # Global 405 handler: Agar HTTP method (GET, POST, PUT, DELETE) match nahi hota
    @app.errorhandler(405)
    def method_not_allowed(e):
        # 405 Method Not Allowed error return kar rahe hain
        return error_response("Method not allowed", status_code=405)

    # Global 500 handler: Agar server me koi unexpected internal exception aata hai
    @app.errorhandler(500)
    def internal_error(e):
        # Database transaction ko safe rakhne ke liye rollback kar rahe hain
        db.session.rollback()
        # 500 Internal Server Error message return kar rahe hain
        return error_response("An internal server error occurred", status_code=500)

    # Fully configured Flask application instance return kar rahe hain
    return app

