import os
import sys
import pytest
from datetime import datetime, date, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.academic import Department, Course, Subject, Student, Teacher, TeacherSubjectAssignment, Enrollment

@pytest.fixture(scope='session')
def app():
    _app = create_app('testing')
    with _app.app_context():
        db.create_all()
        yield _app
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    return app.test_client()

@pytest.fixture(scope='function')
def db_session(app):
    with app.app_context():
        db.create_all()
        yield db.session
        db.session.rollback()
        db.drop_all()

@pytest.fixture(scope='function')
def seed_data(app, db_session):
    # Create Admin
    admin = User(full_name="Admin User", email="admin@test.edu", role="admin")
    admin.set_password("Admin@123")
    db_session.add(admin)

    # Create Department & Course & Subject
    dept = Department(name="Computer Science", code="CS", description="CS Dept")
    db_session.add(dept)
    db_session.flush()

    course = Course(name="B.Tech CS", code="BT-CS", department_id=dept.id, semester_count=8, academic_year="2024-2025")
    db_session.add(course)
    db_session.flush()

    subject = Subject(name="Database Systems", code="CS302", course_id=course.id, semester=5, credits=4)
    db_session.add(subject)
    db_session.flush()

    # Create Teacher
    teacher_user = User(full_name="Teacher User", email="teacher@test.edu", role="teacher")
    teacher_user.set_password("Teacher@123")
    db_session.add(teacher_user)
    db_session.flush()

    teacher = Teacher(user_id=teacher_user.id, employee_id="T001", department_id=dept.id, designation="Professor")
    db_session.add(teacher)
    db_session.flush()

    teacher_assign = TeacherSubjectAssignment(teacher_id=teacher.id, subject_id=subject.id, academic_year="2024-2025", semester=5)
    db_session.add(teacher_assign)

    # Create Student
    student_user = User(full_name="Student User", email="student@test.edu", role="student")
    student_user.set_password("Student@123")
    db_session.add(student_user)
    db_session.flush()

    student = Student(user_id=student_user.id, enrollment_number="S001", department_id=dept.id, course_id=course.id, current_semester=5, admission_year=2022)
    db_session.add(student)
    db_session.flush()

    enrollment = Enrollment(student_id=student.id, subject_id=subject.id, academic_year="2024-2025", semester=5, status="active")
    db_session.add(enrollment)

    db_session.commit()

    return {
        'admin': admin,
        'teacher_user': teacher_user,
        'teacher': teacher,
        'student_user': student_user,
        'student': student,
        'subject': subject,
        'department': dept,
        'course': course
    }

@pytest.fixture(scope='function')
def admin_token(client, seed_data):
    res = client.post('/api/v1/auth/login', json={'email': 'admin@test.edu', 'password': 'Admin@123'})
    return res.get_json()['data']['access_token']

@pytest.fixture(scope='function')
def teacher_token(client, seed_data):
    res = client.post('/api/v1/auth/login', json={'email': 'teacher@test.edu', 'password': 'Teacher@123'})
    return res.get_json()['data']['access_token']

@pytest.fixture(scope='function')
def student_token(client, seed_data):
    res = client.post('/api/v1/auth/login', json={'email': 'student@test.edu', 'password': 'Student@123'})
    return res.get_json()['data']['access_token']
