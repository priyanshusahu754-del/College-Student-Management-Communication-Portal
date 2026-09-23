# Timestamps handle karne ke liye datetime module import kar rahe hai
from datetime import datetime
# Werkzeug se secure password hashing (PBKDF2) aur password verification functions import kar rahe hai
from werkzeug.security import generate_password_hash, check_password_hash
# Database instance import kar rahe hai
from app.extensions import db

# User model jo database me 'users' table ko represent karta hai
class User(db.Model):
    # MySQL / SQLite table ka name
    __tablename__ = 'users'

    # Primary key ID (Auto incremented integer)
    id = db.Column(db.Integer, primary_key=True)
    # User ka pura naam
    full_name = db.Column(db.String(120), nullable=False)
    # Unique email address jisse user login karega, fast lookup ke liye index banaya hai
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    # Secure hashed password string (Plain-text password kabhi store nahi hota)
    password_hash = db.Column(db.String(255), nullable=False)
    # User ka role: 'admin', 'teacher', ya 'student'
    role = db.Column(db.String(20), nullable=False, index=True)
    # Contact phone number (Optional)
    phone = db.Column(db.String(20), nullable=True)
    # Profile picture image URL (Optional)
    avatar_url = db.Column(db.String(255), nullable=True)
    # Account status: True matlab active, False matlab deactivated by admin
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    # Account creation timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Account last update timestamp
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ==================== RELATIONSHIPS ====================
    # Agar user student hai toh uska Student profile 1-to-1 link hoga
    student_profile = db.relationship('Student', back_populates='user', uselist=False, cascade='all, delete-orphan')
    # Agar user faculty hai toh uska Teacher profile 1-to-1 link hoga
    teacher_profile = db.relationship('Teacher', back_populates='user', uselist=False, cascade='all, delete-orphan')
    # User ko aane wale notifications
    notifications = db.relationship('Notification', back_populates='recipient', lazy='dynamic', cascade='all, delete-orphan')
    # User dwara perform kiye gaye audit actions
    audit_logs = db.relationship('AuditLog', back_populates='actor', lazy='dynamic')

    # Plain text password ko hash bana kar password_hash column me save karta hai
    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    # Login ke waqt entered password ko hashed password se match karke True/False return karta hai
    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    # Frontend ko JSON me bhejne ke liye Model ko Python Dictionary me convert karta hai
    def to_dict(self, include_profile=True):
        data = {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        # Role ke hisaab se student ya teacher ka extra profile data include karte hai
        if include_profile:
            if self.role == 'student' and self.student_profile:
                data['student_profile'] = self.student_profile.to_dict()
            elif self.role == 'teacher' and self.teacher_profile:
                data['teacher_profile'] = self.teacher_profile.to_dict()
        return data

    # Debugging ke liye string representation
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
