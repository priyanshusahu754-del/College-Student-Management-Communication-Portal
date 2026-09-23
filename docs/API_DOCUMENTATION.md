# CampusConnect – REST API Documentation

Base URL: `/api/v1`

All protected endpoints require the HTTP header:
`Authorization: Bearer <access_token>`

Standard JSON Response Envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

Standard Error Envelope:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/login`
Authenticates a student, faculty member, or administrator.
- **Request Body**:
  ```json
  {
    "email": "student@campusconnect.edu",
    "password": "Student@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "user": {
        "id": 5,
        "full_name": "Rahul Sharma",
        "email": "rahul.sharma@campusconnect.edu",
        "role": "student",
        "student_profile": {
          "enrollment_number": "CS2022001",
          "current_semester": 5,
          "department_name": "Computer Science & Engineering"
        }
      }
    }
  }
  ```

### `GET /auth/me`
Fetches authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: User profile object.

### `POST /auth/change-password`
Changes current user's password.
- **Request Body**:
  ```json
  {
    "old_password": "Student@123",
    "new_password": "NewPassword@456"
  }
  ```

### `POST /auth/logout`
Logs out and records audit event.

---

## 2. User Management (`/api/v1/users`)

### `GET /users` (Admin Only)
List users with search, role filtering, and status filtering.
- **Query Params**: `page=1`, `per_page=10`, `role=student|teacher|admin`, `status=active|inactive`, `search=name`

### `POST /users` (Admin Only)
Creates a new user and automatically initializes the role profile.
- **Request Body (Student)**:
  ```json
  {
    "full_name": "Neha Gupta",
    "email": "neha.gupta@campusconnect.edu",
    "password": "Student@123",
    "role": "student",
    "phone": "+91 9876543210",
    "enrollment_number": "CS2022004",
    "department_id": 1,
    "course_id": 1,
    "current_semester": 5,
    "admission_year": 2022
  }
  ```

### `PATCH /users/:id`
Updates allowed user fields.

### `PATCH /users/:id/status` (Admin Only)
Toggles user active / inactive account status.

---

## 3. Academic Structure (`/api/v1`)

### `GET /departments`, `POST /departments`, `DELETE /departments/:id`
List and manage academic departments.

### `GET /courses`, `POST /courses`, `DELETE /courses/:id`
List and manage degree programs.

### `GET /subjects`, `POST /subjects`, `DELETE /subjects/:id`
List and manage syllabus subjects.

### `GET /teacher-assignments`, `POST /teacher-assignments`, `DELETE /teacher-assignments/:id`
Assign faculty to courses.

### `GET /enrollments`, `POST /enrollments`, `DELETE /enrollments/:id`
Enroll students into subjects.

---

## 4. Attendance Module (`/api/v1/attendance`)

### `POST /attendance/sessions` (Faculty / Admin)
Create or initialize lecture attendance session for a subject and date.
- **Request Body**:
  ```json
  {
    "subject_id": 2,
    "session_date": "2025-10-15",
    "start_time": "10:00 AM",
    "topic": "Transaction Isolation Levels"
  }
  ```

### `GET /attendance/session/:id` (Faculty / Admin)
Returns the lecture attendance session with the enrolled student roster.

### `POST /attendance/records` (Faculty / Admin)
Saves/updates attendance records for students.
- **Request Body**:
  ```json
  {
    "session_id": 12,
    "records": [
      { "student_id": 1, "status": "present", "remarks": "On time" },
      { "student_id": 2, "status": "absent", "remarks": "Medical leave" }
    ]
  }
  ```

### `GET /attendance/student-summary`
Returns attendance percentage, subject breakdown, and 75% threshold status for the student.

---

## 5. Course Assignments (`/api/v1/assignments`)

### `GET /assignments`
List assignments (filtered by enrolled subjects for students, or faculty allocations).

### `POST /assignments` (Faculty / Admin)
Create assignment with optional file attachment. Multipart Form Data supported.

### `POST /assignments/:id/submit` (Student Only)
Submit solution text and/or file document.

### `GET /assignments/:id/submissions` (Faculty / Admin)
List student submissions for grading.

### `PATCH /assignments/submissions/:id/grade` (Faculty / Admin)
Submit marks and feedback.
- **Request Body**:
  ```json
  {
    "marks": 95.0,
    "feedback": "Outstanding indexing and optimization scripts!"
  }
  ```

---

## 6. Study Materials (`/api/v1/materials`)

### `GET /materials`
Search and filter lecture notes by subject.

### `POST /materials` (Faculty / Admin)
Upload verified study resources (Multipart Form Data).

### `GET /materials/download/:id`
Secure download endpoint for material files.

---

## 7. Official Notices & Circulars (`/api/v1/notices`)

### `GET /notices`
Targeted notices matching user role and department.

### `POST /notices` (Faculty / Admin)
Publish notices with priority (`urgent`, `high`, `medium`, `low`) and audience filters (`all`, `students`, `teachers`, `department`).

---

## 8. Campus Events & Hackathons (`/api/v1/events`)

### `GET /events`
List campus events with student registration state.

### `POST /events` (Admin Only)
Create new campus event with capacity and venue.

### `POST /events/:id/register` (Student Only)
Register for event with capacity limits check.

### `POST /events/:id/cancel` (Student Only)
Cancel event registration.

---

## 9. Examinations & Results (`/api/v1/results`)

### `GET /results/examinations` & `POST /results/examinations`
Manage exam terms.

### `POST /results/bulk-entry` (Faculty / Admin)
Submit batch student marks for a subject.

### `GET /results/my-results` (Student)
Returns student semester marksheet and calculated CGPA.

---

## 10. Platform Administration & Health

### `GET /admin/analytics/overview` (Admin Only)
Live aggregated counts, department distributions, attendance rates, and submission metrics.

### `GET /admin/audit-logs` (Admin Only)
Chronological security audit stream.

### `GET /health` (Public)
Server and database connectivity probe.
