import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file from backend root
base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(base_dir, '.env'))

class Config:
    """Base Configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'campusconnect-super-secret-dev-key-2025')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'campusconnect-jwt-secret-dev-key-2025')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_HOURS', '24')))
    
    # Upload configuration
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(base_dir, 'uploads'))
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max limit
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'zip'}
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
    
    # Database configuration
    # Default to SQLite for seamless turnkey local dev, but fully supports MySQL via DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(base_dir, 'campusconnect.db')}")


class DevelopmentConfig(Config):
    """Development Configuration"""
    DEBUG = True


class TestingConfig(Config):
    """Testing Configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)


class ProductionConfig(Config):
    """Production Configuration"""
    DEBUG = False
    TESTING = False
    # Ensure production uses strong secret keys
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')


config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
