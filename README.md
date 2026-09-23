# CampusConnect – College Student Management & Communication Portal

CampusConnect is a production-oriented, full-stack Academic ERP & Student Management Portal engineered for B.Tech final-year project evaluations, live demonstrations, and institutional deployment.

---

## 🚀 Key Features by User Role

### 🎓 Student Portal
- **Real-Time Attendance Tracker**: Subject-wise percentage tracking, conducted vs. attended counts, and automated 75% threshold warnings.
- **Assignments & Coursework**: View published tasks, submit solution notes or file attachments, and view faculty grading rubrics with remarks.
- **Academic Results & Marksheets**: Semester-wise statements of grades, credit distribution, percentage, and printable transcript view.
- **Study Materials Repository**: Search and download verified faculty lecture slides, PDF notes, and syllabus blueprints.
- **Campus Notices & Circulars**: Filter official college announcements by priority (Urgent, High, Medium, Low).
- **Event Registrations**: Browse campus hackathons, symposiums, and fests with instant 1-click registration.
- **Profile & Password Management**: View academic identity and change security credentials.

### 👨‍🏫 Faculty / Teacher Portal
- **Lecture Attendance Register**: One-click "Mark All Present", status toggles (Present, Absent, Late, Excused), and past session editor.
- **Assignment Manager**: Publish tasks with deadlines and maximum marks, review student submissions in an interactive drawer, and award marks with feedback.
- **Course Material Hub**: Upload handouts and reference materials categorized by course and semester.
- **Examination Marks Entry**: Spreadsheet-like grade matrix with automated grade calculations (A+, A, B, C, D, F).
- **My Subjects Allocations**: Overview of assigned teaching allocations and syllabus subjects.

### 👑 Administrator ERP Control Center
- **Live Institutional Analytics**: Interactive Recharts dashboards showing department student/faculty distribution, user demographics, and attendance rates.
- **User Lifecycle Management**: Provision students, faculty, and admins with auto-generated profiles; toggle active/deactivated statuses.
- **Curriculum Architecture**: Manage Departments, Degree Programs, Syllabus Subjects, Faculty Allocations, and Student Enrollments.
- **Circular Broadcasting**: Target notices to the entire campus, specific faculties, or individual branches.
- **Campus Event Hosting**: Create events, manage venues, set capacity constraints, and export attendee rosters.
- **Security Audit Trail**: Searchable, chronological log of system actions with sanitized metadata.
- **System Health Monitor**: Live diagnostics for database connectivity and REST API health.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Modular component architecture, Fast HMR |
| **Styling** | Tailwind CSS | SaaS-style palette, Glassmorphism accents, Responsive drawer |
| **Icons & Charts** | Lucide React + Recharts | Consistent icon set, interactive Bar/Pie charts |
| **HTTP Client** | Axios | Automatic JWT bearer interceptors & 401 handling |
| **Routing** | React Router v6 | Protected routes with Role-Based Access Control |
| **Backend** | Python 3.11+ / Flask 3.x | Application Factory Pattern, Modular Blueprints |
| **Database ORM** | SQLAlchemy + Flask-Migrate | MySQL 8+ support with zero-config SQLite local fallback |
| **Authentication** | Flask-JWT-Extended | 24-Hour Bearer Tokens + Werkzeug password hashing |
| **Automated Tests** | Pytest | 13 Comprehensive Unit & Workflow tests |
| **WSGI Server** | Gunicorn | Production Linux deployment entry point |

---

## ⚡ Quick Start & Local Run Instructions

### 1. Prerequisites
- Python 3.11+ (Python 3.14 supported)
- Node.js 18+ and npm

### 2. Backend Setup
```powershell
# 1. Navigate to backend
cd backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Seed Database with Realistic Demo Data (Idempotent)
python seed.py

# 4. Start Flask REST API Server
python run.py
```
*Backend runs on `http://127.0.0.1:5000`.*

### 3. Frontend Setup
```powershell
# 1. In a new terminal, navigate to frontend
cd frontend

# 2. Install npm packages
npm install

# 3. Start Vite Development Server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Credentials (For Viva & Live Demonstrations)

| Role | Email Address | Password | Name / Designation |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@campusconnect.edu` | `Admin@123` | Dr. Rajeshwar Sharma (Dean Academic) |
| **👨‍🏫 Teacher** | `sharma.cs@campusconnect.edu` | `Teacher@123` | Prof. Vikram Sharma (HOD - CSE) |
| **👨‍🏫 Teacher** | `verma.ee@campusconnect.edu` | `Teacher@123` | Dr. Ananya Verma (Associate Prof.) |
| **🎓 Student** | `rahul.sharma@campusconnect.edu` | `Student@123` | Rahul Sharma (B.Tech CSE, Sem 5) |
| **🎓 Student** | `priya.singh@campusconnect.edu` | `Student@123` | Priya Singh (B.Tech CSE, Sem 5) |
| **🎓 Student** | `amit.kumar@campusconnect.edu` | `Student@123` | Amit Kumar (B.Tech CSE, Sem 5) |

> **💡 Tip for Live Presentations:** The login screen features **1-click quick-fill buttons** (`👑 Admin`, `👨‍🏫 Faculty`, `🎓 Student`) to instantly populate credentials.

---

## 🧪 Running Automated Tests

Run the Pytest test suite from the repository root:
```powershell
python -m pytest backend/tests/ -v
```
**Test Results Summary**:
- `test_health_endpoint`: ✅ PASSED
- `test_login_success`: ✅ PASSED
- `test_login_invalid_password`: ✅ PASSED
- `test_login_deactivated_user`: ✅ PASSED
- `test_auth_me_endpoint`: ✅ PASSED
- `test_change_password`: ✅ PASSED
- `test_attendance_flow`: ✅ PASSED
- `test_assignment_workflow`: ✅ PASSED
- `test_event_registration`: ✅ PASSED
- `test_unauthenticated_request_fails`: ✅ PASSED
- `test_student_cannot_access_admin_endpoint`: ✅ PASSED
- `test_teacher_cannot_access_admin_endpoint`: ✅ PASSED
- `test_admin_can_access_admin_endpoint`: ✅ PASSED

---

## 🏗️ Production Frontend Build

To validate or build the static production bundle:
```powershell
npm run build --prefix frontend
```
Build output is saved to `frontend/dist/`.

---

## 📚 Technical Documentation Directory

- [Database Schema Documentation](file:///e:/College%20Student%20Management%20&%20Communication%20Portal/docs/DATABASE_SCHEMA.md)
- [REST API Reference](file:///e:/College%20Student%20Management%20&%20Communication%20Portal/docs/API_DOCUMENTATION.md)
- [System Architecture & Design](file:///e:/College%20Student%20Management%20&%20Communication%20Portal/docs/PROJECT_ARCHITECTURE.md)
- [Production Deployment Guide](file:///e:/College%20Student%20Management%20&%20Communication%20Portal/docs/DEPLOYMENT_GUIDE.md)
- [B.Tech Viva Questions & Answers](file:///e:/College%20Student%20Management%20&%20Communication%20Portal/docs/VIVA_QUESTIONS.md)
