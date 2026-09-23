# CampusConnect – B.Tech Viva Questions & Technical Answers

This document prepares you for technical viva, final-year project defense, and external examiner queries.

---

### Q1: What is CampusConnect, and what problem does it solve?
**Answer:** CampusConnect is an integrated full-stack College ERP and Communication Portal. It eliminates scattered academic workflows by consolidating student information, lecture attendance tracking, digital assignment submissions, study material repositories, official circulars, examination results, and event management into a centralized, role-based platform.

### Q2: Why did you choose Flask over Django or FastAPI?
**Answer:** 
- **Modularity & Lightweight Core:** Flask provides maximum architectural flexibility via the Application Factory pattern and Blueprints, avoiding Django's monolithic boilerplate while offering a clean, standard RESTful structure.
- **Explicit ORM Control:** Using Flask with SQLAlchemy ORM allows explicit control over relational database constraints, cascading, indexes, and session management.
- **Scalability:** Combined with Flask-JWT-Extended and Gunicorn, Flask is lightweight and highly performant for microservices and API-first architectures.

### Q3: Why React and Vite for the Frontend?
**Answer:** 
- **Component-Driven UI:** React enables reusable UI building blocks (`DataTable`, `Modal`, `StatCard`, `FileUploadDropzone`) and dynamic declarative rendering.
- **Fast Build Times:** Vite uses native ES modules during development, delivering instant hot module replacement (HMR) and fast production builds using Rollup.
- **Modern Ecosystem:** Seamless integration with Tailwind CSS for utility-first styling and Recharts for interactive analytics.

### Q4: How does JWT (JSON Web Token) authentication work in your application?
**Answer:** 
1. When a user submits valid credentials to `/api/v1/auth/login`, Flask verifies the Werkzeug password hash.
2. If valid and the account is active, `create_access_token` generates a signed JWT containing the user identity (User ID) and signature signed with `JWT_SECRET_KEY`.
3. The React client stores the token and includes it in the `Authorization: Bearer <token>` header for all API requests via Axios interceptors.
4. On protected routes, the `@jwt_required()` decorator extracts and validates the cryptographic signature and expiration time without requiring server-side session state.

### Q5: How is Role-Based Access Control (RBAC) enforced?
**Answer:** RBAC is enforced both on the client and server:
- **Server-Side Enforcement:** Custom Python decorators (`@role_required(['admin'])`, `@teacher_required`, `@student_required`) verify the user's role from the database on every single protected endpoint. Even if someone bypasses frontend checks, unauthorized requests return `403 Forbidden`.
- **Client-Side Enforcement:** React Router's `<ProtectedRoute allowedRoles={['student']} />` component prevents unauthorized users from rendering views outside their role.

### Q6: How are duplicate attendance records and duplicate event registrations prevented?
**Answer:** 
1. **Database-Level Unique Constraints:**
   - In `attendance_records`: `UniqueConstraint('session_id', 'student_id')`.
   - In `event_registrations`: `UniqueConstraint('event_id', 'student_id')`.
   - In `teacher_subject_assignments`: `UniqueConstraint('teacher_id', 'subject_id', 'academic_year')`.
2. **Application-Level Logic:** The API route checks for existing records before inserting and performs safe updates (upsert) instead of duplicate insertions.

### Q7: How is the attendance percentage calculated?
**Answer:** 
$$\text{Attendance Percentage} = \left( \frac{\text{Present} + \text{Excused} + \text{Late}}{\text{Total Sessions Conducted}} \right) \times 100$$
The application queries all conducted lecture sessions for each enrolled subject, sums up the attended count, and flags subjects where the percentage falls below the statutory 75% threshold.

### Q8: What database are you using, and how does the backend connect to it?
**Answer:** The application uses **MySQL 8+** for production and supports **SQLite** for zero-config local development. SQLAlchemy ORM manages database connections using connection strings:
- SQLite: `sqlite:///campusconnect.db`
- MySQL: `mysql+pymysql://user:password@host:3306/campusconnect_db`
Flask-Migrate (Alembic) manages schema migrations.

### Q9: How are passwords stored securely?
**Answer:** Plain-text passwords are never stored. Werkzeug's `generate_password_hash` uses PBKDF2 with SHA-256 and unique cryptographic salts. Password verification uses constant-time string comparisons via `check_password_hash` to prevent timing attacks.

### Q10: How do you handle file uploads safely?
**Answer:**
1. Validating file extensions against a strict whitelist (`.pdf`, `.docx`, `.pptx`, `.zip`, `.png`, `.jpg`).
2. Sanitizing filenames using `werkzeug.utils.secure_filename` and prepending unique UUIDs (`uuid.uuid4().hex`) to avoid filename collisions.
3. Enforcing a 16MB file size limit (`MAX_CONTENT_LENGTH`).
4. Storing files in a dedicated storage directory outside the source code root and serving downloads through authorized endpoints (`/materials/download/:id`).

### Q11: What is the Application Factory Pattern in Flask?
**Answer:** The Application Factory pattern encapsulates application creation inside a `create_app(config_name)` function. This allows creating different application instances with isolated configurations (e.g., `development`, `testing` with in-memory SQLite, `production`) without global state side effects.

### Q12: How are audit logs implemented?
**Answer:** Whenever a critical action occurs (user creation, login, grading, circular publishing, status toggle), the `log_audit_action` utility records the actor ID, action name, target entity, client IP address, and user-agent. Sensitive data like passwords, tokens, and authorization headers are automatically stripped.

### Q13: What automated tests did you write?
**Answer:** We wrote a Pytest test suite inside `backend/tests/` covering:
- Health check probe
- Successful & invalid logins
- Token expiration & deactivated accounts
- Password change & hashing
- RBAC authorization barriers (401 & 403 checks)
- Attendance session creation & duplicate prevention
- Assignment creation, student submission, and teacher grading
- Event registration & capacity limit enforcement
- Database relationship integrity

### Q14: What are the current limitations of the project and future enhancements?
**Answer:**
- **Current Limitations:** Real-time communication relies on polling rather than WebSockets; local file storage is used by default rather than cloud S3/GCS buckets.
- **Future Enhancements:** Integrating WebSocket notifications via Socket.IO, SMS/Email push alerts using Twilio/SendGrid, online fee payment gateway (Razorpay/Stripe), and timetable scheduling algorithms.
