# CampusConnect – Project Architecture & Engineering Design

## 1. Architectural Overview

CampusConnect is structured as a modern multi-tiered Client-Server application following the Application Factory Pattern and Component-Driven Architecture.

```
+-------------------------------------------------------------+
|                      PRESENTATION LAYER                     |
|  React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts   |
|  - Role-Guarded Client Router (Student / Faculty / Admin)   |
|  - Global State Contexts (AuthContext, NotificationContext) |
|  - Axios HTTP Client with Automatic JWT Interceptors        |
+-------------------------------------------------------------+
                              |
                     HTTPS / JSON REST API
                              |
+-------------------------------------------------------------+
|                     APPLICATION LAYER                       |
|  Flask 3.x REST API Engine                                  |
|  - Modular Blueprints (/auth, /users, /attendance, etc.)    |
|  - Security Layer (@jwt_required, @role_required)           |
|  - Business Services (Grading, Attendance, Analytics)       |
|  - Sanitized Audit Logging Service                          |
+-------------------------------------------------------------+
                              |
                        SQLAlchemy ORM
                              |
+-------------------------------------------------------------+
|                       DATABASE LAYER                        |
|  MySQL 8+ / SQLite Fallback                                 |
|  - Normalized Relational Tables & Foreign Keys              |
|  - Unique Constraints & Indexes                             |
|  - Flask-Migrate (Alembic) Database Migrations              |
+-------------------------------------------------------------+
```

---

## 2. Security Architecture

### Authentication Mechanism
1. User supplies email and password to `/api/v1/auth/login`.
2. Backend verifies hash with Werkzeug's `check_password_hash` (PBKDF2 with SHA256).
3. Active account status is verified (`is_active == True`).
4. Flask-JWT-Extended signs a signed JWT access token embedded with the user ID and 24-hour expiration.
5. The client stores the token in secure browser storage and attaches `Authorization: Bearer <token>` automatically on every subsequent request via Axios interceptors.

### Role-Based Access Control (RBAC)
- All privileged endpoints enforce RBAC on the backend via python decorators (`@role_required(['admin'])`, `@teacher_required`, `@student_required`).
- Frontend route wrappers (`<ProtectedRoute allowedRoles={['student']} />`) prevent unauthorized navigation.
- If an unauthorized user accesses an endpoint, the backend immediately returns `403 Forbidden`.

### Data Sanitization and Audit Logging
- Audit logs capture actor ID, action, target entity, IP address, and user-agent.
- All metadata dictionary payloads are filtered to strip sensitive attributes like `password`, `token`, `secret`, and `hash`.

---

## 3. Data Flow Workflows

### Attendance Flow
1. Faculty selects assigned subject and date.
2. Backend verifies faculty allocation to subject in `teacher_subject_assignments`.
3. Session is created or retrieved from `attendance_sessions`.
4. Roster of enrolled students is queried via `enrollments`.
5. Faculty marks attendance with one-click toggles and submits to `/attendance/records`.
6. Unique constraint `UNIQUE(session_id, student_id)` prevents duplicate records.
7. Student dashboard calculates attendance percentage:
   $$\text{Attendance \%} = \left( \frac{\text{Present} + \text{Excused} + \text{Late}}{\text{Total Conducted Sessions}} \right) \times 100$$
8. If attendance is under 75%, an alert badge is rendered.
