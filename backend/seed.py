import os
import sys
from datetime import datetime, date, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.academic import Department, Course, Subject, Student, Teacher, TeacherSubjectAssignment, Enrollment
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.material import StudyMaterial
from app.models.communication import Notice, Event, EventRegistration
from app.models.examination import Examination, Result
from app.models.system import Notification, AuditLog

app = create_app('development')

def seed_database():
    with app.app_context():
        print("Creating database tables...")
        db.create_all()

        # Check if already seeded
        if User.query.filter_by(email='admin@campusconnect.edu').first():
            print("Database already contains seed data! To re-seed, drop tables or delete campusconnect.db.")
            return

        print("Seeding Departments...")
        cse_dept = Department(name="Computer Science & Engineering", code="CSE", description="Department of Computer Science and Engineering offering high-tier computing curriculum.")
        it_dept = Department(name="Information Technology", code="IT", description="Department of Information Technology focusing on modern software engineering.")
        ece_dept = Department(name="Electronics & Communication", code="ECE", description="Department of Electronics and Communication Engineering.")
        me_dept = Department(name="Mechanical Engineering", code="ME", description="Department of Mechanical Engineering and Robotics.")
        
        db.session.add_all([cse_dept, it_dept, ece_dept, me_dept])
        db.session.flush()

        print("Seeding Courses...")
        btech_cse = Course(name="B.Tech Computer Science & Engineering", code="BT-CSE", department_id=cse_dept.id, semester_count=8, academic_year="2024-2025")
        btech_it = Course(name="B.Tech Information Technology", code="BT-IT", department_id=it_dept.id, semester_count=8, academic_year="2024-2025")
        btech_ece = Course(name="B.Tech Electronics & Communication", code="BT-ECE", department_id=ece_dept.id, semester_count=8, academic_year="2024-2025")
        
        db.session.add_all([btech_cse, btech_it, btech_ece])
        db.session.flush()

        print("Seeding Subjects...")
        sub_dsa = Subject(name="Data Structures & Algorithms", code="CS301", course_id=btech_cse.id, semester=5, credits=4)
        sub_dbms = Subject(name="Database Management Systems", code="CS302", course_id=btech_cse.id, semester=5, credits=4)
        sub_os = Subject(name="Operating Systems", code="CS303", course_id=btech_cse.id, semester=5, credits=4)
        sub_cn = Subject(name="Computer Networks", code="CS304", course_id=btech_cse.id, semester=5, credits=3)
        sub_web = Subject(name="Web Technologies & Full Stack", code="CS305", course_id=btech_cse.id, semester=5, credits=3)
        
        db.session.add_all([sub_dsa, sub_dbms, sub_os, sub_cn, sub_web])
        db.session.flush()

        print("Seeding Admin User...")
        admin_user = User(
            full_name="Dr. Rajeshwar Sharma",
            email="admin@campusconnect.edu",
            role="admin",
            phone="+91 98765 43210",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
        )
        admin_user.set_password("Admin@123")
        db.session.add(admin_user)
        db.session.flush()

        print("Seeding Teachers...")
        t1_user = User(
            full_name="Prof. Vikram Sharma",
            email="sharma.cs@campusconnect.edu",
            role="teacher",
            phone="+91 98111 22334",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        t1_user.set_password("Teacher@123")
        db.session.add(t1_user)
        db.session.flush()
        
        t1 = Teacher(
            user_id=t1_user.id,
            employee_id="FAC-CS-01",
            department_id=cse_dept.id,
            designation="Professor & HOD",
            qualification="Ph.D. in Computer Science (IIT Delhi)"
        )

        t2_user = User(
            full_name="Dr. Ananya Verma",
            email="verma.ee@campusconnect.edu",
            role="teacher",
            phone="+91 98222 33445",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        )
        t2_user.set_password("Teacher@123")
        db.session.add(t2_user)
        db.session.flush()

        t2 = Teacher(
            user_id=t2_user.id,
            employee_id="FAC-CS-02",
            department_id=cse_dept.id,
            designation="Associate Professor",
            qualification="M.Tech, Ph.D. in Distributed Systems"
        )

        t3_user = User(
            full_name="Prof. Rajesh Patel",
            email="patel.me@campusconnect.edu",
            role="teacher",
            phone="+91 98333 44556",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        )
        t3_user.set_password("Teacher@123")
        db.session.add(t3_user)
        db.session.flush()

        t3 = Teacher(
            user_id=t3_user.id,
            employee_id="FAC-IT-01",
            department_id=it_dept.id,
            designation="Assistant Professor",
            qualification="M.Tech in Software Engineering"
        )

        db.session.add_all([t1, t2, t3])
        db.session.flush()

        print("Assigning Teachers to Subjects...")
        assign1 = TeacherSubjectAssignment(teacher_id=t1.id, subject_id=sub_dbms.id, academic_year="2024-2025", semester=5)
        assign2 = TeacherSubjectAssignment(teacher_id=t1.id, subject_id=sub_os.id, academic_year="2024-2025", semester=5)
        assign3 = TeacherSubjectAssignment(teacher_id=t2.id, subject_id=sub_web.id, academic_year="2024-2025", semester=5)
        assign4 = TeacherSubjectAssignment(teacher_id=t2.id, subject_id=sub_cn.id, academic_year="2024-2025", semester=5)
        assign5 = TeacherSubjectAssignment(teacher_id=t3.id, subject_id=sub_dsa.id, academic_year="2024-2025", semester=5)
        db.session.add_all([assign1, assign2, assign3, assign4, assign5])
        db.session.flush()

        print("Seeding Students...")
        students_info = [
            ("Rahul Sharma", "rahul.sharma@campusconnect.edu", "CS2022001", cse_dept.id, btech_cse.id, 5, 2022, "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"),
            ("Priya Singh", "priya.singh@campusconnect.edu", "CS2022002", cse_dept.id, btech_cse.id, 5, 2022, "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"),
            ("Amit Kumar", "amit.kumar@campusconnect.edu", "CS2022003", cse_dept.id, btech_cse.id, 5, 2022, "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150"),
            ("Neha Gupta", "neha.gupta@campusconnect.edu", "CS2022004", cse_dept.id, btech_cse.id, 5, 2022, "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150"),
            ("Rohit Verma", "rohit.verma@campusconnect.edu", "CS2022005", cse_dept.id, btech_cse.id, 5, 2022, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"),
            ("Sneha Patel", "sneha.patel@campusconnect.edu", "IT2022001", it_dept.id, btech_it.id, 5, 2022, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"),
            ("Kunal Joshi", "kunal.joshi@campusconnect.edu", "IT2022002", it_dept.id, btech_it.id, 5, 2022, "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"),
            ("Ananya Deshmukh", "ananya.deshmukh@campusconnect.edu", "EC2022001", ece_dept.id, btech_ece.id, 5, 2022, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"),
        ]

        created_students = []
        for name, email, enroll_no, d_id, c_id, sem, adm_yr, avatar in students_info:
            s_user = User(
                full_name=name,
                email=email,
                role="student",
                phone="+91 97000 11223",
                avatar_url=avatar
            )
            s_user.set_password("Student@123")
            db.session.add(s_user)
            db.session.flush()

            s_profile = Student(
                user_id=s_user.id,
                enrollment_number=enroll_no,
                department_id=d_id,
                course_id=c_id,
                current_semester=sem,
                admission_year=adm_yr,
                date_of_birth=date(2003, 5, 15)
            )
            db.session.add(s_profile)
            created_students.append(s_profile)

        db.session.flush()

        print("Enrolling CSE Students in Sem 5 Subjects...")
        cse_subjects = [sub_dsa, sub_dbms, sub_os, sub_cn, sub_web]
        cse_students = [s for s in created_students if s.department_id == cse_dept.id]

        for s in cse_students:
            for sub in cse_subjects:
                enr = Enrollment(
                    student_id=s.id,
                    subject_id=sub.id,
                    academic_year="2024-2025",
                    semester=5,
                    status="active"
                )
                db.session.add(enr)
        db.session.flush()

        print("Seeding Attendance Sessions and Records...")
        # Create 8 past sessions for DBMS
        today = date.today()
        for i in range(1, 9):
            s_date = today - timedelta(days=(9 - i) * 3)
            session = AttendanceSession(
                subject_id=sub_dbms.id,
                teacher_id=t1.id,
                session_date=s_date,
                start_time="10:00 AM",
                topic=f"DBMS Unit {i} - Architecture, Query Optimization & Transaction Management"
            )
            db.session.add(session)
            db.session.flush()

            for s_idx, st in enumerate(cse_students):
                # Set realistic attendance: Rahul & Priya high (85-100%), Amit low (60%)
                if st.enrollment_number == "CS2022003" and i in [2, 4, 6]:
                    stat = "absent"
                elif st.enrollment_number == "CS2022005" and i in [3, 7]:
                    stat = "late"
                else:
                    stat = "present"

                rec = AttendanceRecord(
                    session_id=session.id,
                    student_id=st.id,
                    status=stat,
                    remarks="Regular session" if stat == "present" else "Absent without leave"
                )
                db.session.add(rec)

        # Create 6 sessions for Web Tech
        for i in range(1, 7):
            s_date = today - timedelta(days=(7 - i) * 4)
            session = AttendanceSession(
                subject_id=sub_web.id,
                teacher_id=t2.id,
                session_date=s_date,
                start_time="02:00 PM",
                topic=f"Web Tech Lab {i} - React Hooks, REST APIs & State Management"
            )
            db.session.add(session)
            db.session.flush()

            for st in cse_students:
                stat = "present" if not (st.enrollment_number == "CS2022003" and i == 3) else "absent"
                rec = AttendanceRecord(
                    session_id=session.id,
                    student_id=st.id,
                    status=stat
                )
                db.session.add(rec)

        db.session.flush()

        print("Seeding Assignments and Submissions...")
        asgn1 = Assignment(
            title="Assignment 1: Relational Schema & 3NF Normalization",
            description="Design an ER diagram and convert it to 3NF relational schemas for a hospital management system. Submit detailed SQL DDL scripts.",
            subject_id=sub_dbms.id,
            teacher_id=t1.id,
            due_date=datetime.utcnow() + timedelta(days=5),
            total_marks=100.0,
            status="published"
        )
        asgn2 = Assignment(
            title="Assignment 2: Page Replacement Algorithm Simulation",
            description="Implement FIFO, LRU, and Optimal page replacement algorithms in C++/Python and compare hit-to-miss ratios across 1000 memory references.",
            subject_id=sub_os.id,
            teacher_id=t1.id,
            due_date=datetime.utcnow() + timedelta(days=10),
            total_marks=50.0,
            status="published"
        )
        asgn3 = Assignment(
            title="Assignment 3: REST API with JWT Authentication",
            description="Build a secure Flask REST API providing token-based authentication and role-based access control. Include Postman collection.",
            subject_id=sub_web.id,
            teacher_id=t2.id,
            due_date=datetime.utcnow() - timedelta(days=2),  # Past due
            total_marks=100.0,
            status="published"
        )
        db.session.add_all([asgn1, asgn2, asgn3])
        db.session.flush()

        # Submissions for Rahul (s[0]) and Priya (s[1])
        subm1 = AssignmentSubmission(
            assignment_id=asgn1.id,
            student_id=cse_students[0].id,
            submission_text="Designed 3NF ER schema for Hospital Management with BCNF decomposed tables and foreign key constraints.",
            submitted_at=datetime.utcnow() - timedelta(days=1),
            status="graded",
            marks=94.0,
            feedback="Outstanding schema design and indexing strategy. Excellent work!",
            graded_at=datetime.utcnow() - timedelta(hours=5),
            graded_by_id=t1.id
        )
        subm2 = AssignmentSubmission(
            assignment_id=asgn1.id,
            student_id=cse_students[1].id,
            submission_text="Complete SQL scripts with composite keys and triggers attached.",
            submitted_at=datetime.utcnow() - timedelta(days=2),
            status="graded",
            marks=98.0,
            feedback="Perfect 3NF normalization and clean execution scripts.",
            graded_at=datetime.utcnow() - timedelta(hours=6),
            graded_by_id=t1.id
        )
        subm3 = AssignmentSubmission(
            assignment_id=asgn3.id,
            student_id=cse_students[0].id,
            submission_text="Implemented Flask JWT extended auth with role decorators and automated unit test suite.",
            submitted_at=datetime.utcnow() - timedelta(days=3),
            status="graded",
            marks=96.0,
            feedback="Very solid implementation of RBAC middleware.",
            graded_at=datetime.utcnow() - timedelta(days=1),
            graded_by_id=t2.id
        )
        db.session.add_all([subm1, subm2, subm3])
        db.session.flush()

        print("Seeding Study Materials...")
        m1 = StudyMaterial(
            title="DBMS Unit 1-3 Complete Lecture Notes & SQL Cheatsheet",
            description="Comprehensive lecture slides covering Relational Algebra, SQL queries, Normalization (1NF, 2NF, 3NF, BCNF) and Concurrency.",
            subject_id=sub_dbms.id,
            uploaded_by=t1_user.id,
            file_path="materials/dbms_unit_1_3_complete_notes.pdf",
            file_name="dbms_unit_1_3_complete_notes.pdf",
            file_type="pdf",
            file_size_bytes=2450000
        )
        m2 = StudyMaterial(
            title="Operating Systems: Memory Management & Deadlock Prevention",
            description="Visual diagrams of Paging, Segmentation, Inverted Page Tables, and Banker's Deadlock avoidance algorithm.",
            subject_id=sub_os.id,
            uploaded_by=t1_user.id,
            file_path="materials/os_memory_deadlock_guide.pdf",
            file_name="os_memory_deadlock_guide.pdf",
            file_type="pdf",
            file_size_bytes=1820000
        )
        m3 = StudyMaterial(
            title="Full Stack Web Development Architecture & React Guide",
            description="Complete reference for modern SPA architecture, Vite React build process, Tailwind layout patterns, and Axios interceptors.",
            subject_id=sub_web.id,
            uploaded_by=t2_user.id,
            file_path="materials/react_fullstack_architecture.pdf",
            file_name="react_fullstack_architecture.pdf",
            file_type="pdf",
            file_size_bytes=3100000
        )
        db.session.add_all([m1, m2, m3])
        db.session.flush()

        print("Seeding Notices...")
        n1 = Notice(
            title="Urgent: Mid-Term Examination Schedule Fall 2025 Announced",
            content="The Mid-Term Examinations for all 3rd, 5th, and 7th Semester B.Tech students will commence from next Monday. Students must carry valid college ID cards to the exam halls. Detailed date sheet is available on the portal.",
            created_by=admin_user.id,
            audience="all",
            priority="urgent",
            published_at=datetime.utcnow() - timedelta(days=1),
            is_active=True
        )
        n2 = Notice(
            title="Annual College Hackathon 'HackCampus 2025' Registrations Open",
            content="Join the 36-hour flagship hackathon on AI, Web3, and Full Stack Engineering. Exciting prizes worth ₹2,00,000 and internship opportunities with top tech firms. Register via the Events section.",
            created_by=admin_user.id,
            audience="students",
            priority="high",
            published_at=datetime.utcnow() - timedelta(days=3),
            is_active=True
        )
        n3 = Notice(
            title="Faculty Workshop: Advanced Generative AI Tools in Academic Research",
            content="A 2-day hands-on workshop on leveraging LLMs for syllabus curriculum design and computational research will be hosted this Friday in the CS Seminar Hall.",
            created_by=admin_user.id,
            audience="teachers",
            priority="medium",
            published_at=datetime.utcnow() - timedelta(days=4),
            is_active=True
        )
        db.session.add_all([n1, n2, n3])
        db.session.flush()

        print("Seeding Events...")
        ev1 = Event(
            title="HackCampus 2025 - National Level Hackathon",
            description="36-hour non-stop codeathon featuring tracks in Generative AI, EdTech, Cloud Infrastructure, and IoT Solutions.",
            venue="Central Auditorium & Computing Labs",
            start_datetime=datetime.utcnow() + timedelta(days=12),
            end_datetime=datetime.utcnow() + timedelta(days=14),
            organizer_id=admin_user.id,
            capacity=200,
            status="upcoming",
            image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600"
        )
        ev2 = Event(
            title="TechSymposium 2025: Cloud & Microservices Summit",
            description="Keynote talks by distinguished industry architects from Google, Microsoft, and Amazon on distributed systems scalability.",
            venue="APJ Abdul Kalam Seminar Hall",
            start_datetime=datetime.utcnow() + timedelta(days=20),
            end_datetime=datetime.utcnow() + timedelta(days=21),
            organizer_id=t1_user.id,
            capacity=150,
            status="upcoming",
            image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"
        )
        db.session.add_all([ev1, ev2])
        db.session.flush()

        # Seed event registrations
        reg1 = EventRegistration(event_id=ev1.id, student_id=cse_students[0].id, status="registered")
        reg2 = EventRegistration(event_id=ev1.id, student_id=cse_students[1].id, status="registered")
        reg3 = EventRegistration(event_id=ev1.id, student_id=cse_students[2].id, status="registered")
        db.session.add_all([reg1, reg2, reg3])
        db.session.flush()

        print("Seeding Examinations and Results...")
        exam = Examination(
            name="Mid-Term Assessment Fall 2024",
            academic_year="2024-2025",
            semester=5,
            exam_type="midterm",
            start_date=date.today() - timedelta(days=30),
            end_date=date.today() - timedelta(days=20),
            is_published=True
        )
        db.session.add(exam)
        db.session.flush()

        # Results for Rahul
        res1 = Result(examination_id=exam.id, student_id=cse_students[0].id, subject_id=sub_dbms.id, marks_obtained=92.0, maximum_marks=100.0, grade="A+", remarks="Exceptional conceptual grasp")
        res2 = Result(examination_id=exam.id, student_id=cse_students[0].id, subject_id=sub_os.id, marks_obtained=88.0, maximum_marks=100.0, grade="A", remarks="Very good performance")
        res3 = Result(examination_id=exam.id, student_id=cse_students[0].id, subject_id=sub_web.id, marks_obtained=95.0, maximum_marks=100.0, grade="A+", remarks="Top marks in full stack")
        res4 = Result(examination_id=exam.id, student_id=cse_students[0].id, subject_id=sub_dsa.id, marks_obtained=85.0, maximum_marks=100.0, grade="A", remarks="Strong algorithmic problem solving")

        # Results for Priya
        res5 = Result(examination_id=exam.id, student_id=cse_students[1].id, subject_id=sub_dbms.id, marks_obtained=96.0, maximum_marks=100.0, grade="A+", remarks="Class topper")
        res6 = Result(examination_id=exam.id, student_id=cse_students[1].id, subject_id=sub_os.id, marks_obtained=91.0, maximum_marks=100.0, grade="A+", remarks="Excellent theoretical understanding")

        db.session.add_all([res1, res2, res3, res4, res5, res6])
        db.session.flush()

        print("Seeding Notifications & Audit Logs...")
        notif1 = Notification(
            recipient_user_id=cse_students[0].user_id,
            title="Assignment Graded",
            message="Your submission for 'Assignment 1: Relational Schema' has been graded. Marks: 94/100.",
            notification_type="assignment",
            link="/student/assignments"
        )
        notif2 = Notification(
            recipient_user_id=cse_students[0].user_id,
            title="New Urgent Notice Published",
            message="Mid-Term Examination Schedule Fall 2025 has been released by Dean Office.",
            notification_type="notice",
            link="/student/notices"
        )
        db.session.add_all([notif1, notif2])

        log1 = AuditLog(
            actor_user_id=admin_user.id,
            action="SYSTEM_INIT_SEED",
            entity_type="system",
            metadata_json='{"version": "1.0.0", "seeded_by": "Dr. Rajeshwar Sharma"}'
        )
        db.session.add(log1)

        db.session.commit()
        print("\n=======================================================")
        print(" CampusConnect Database Seed Completed Successfully! ")
        print("=======================================================")
        print(" Demo Credentials for Viva & Presentations:")
        print(" -----------------------------------------------------")
        print(" [ADMIN]   admin@campusconnect.edu       | Admin@123")
        print(" [TEACHER] sharma.cs@campusconnect.edu   | Teacher@123")
        print(" [TEACHER] verma.ee@campusconnect.edu    | Teacher@123")
        print(" [STUDENT] rahul.sharma@campusconnect.edu| Student@123")
        print(" [STUDENT] priya.singh@campusconnect.edu | Student@123")
        print(" [STUDENT] amit.kumar@campusconnect.edu  | Student@123")
        print("=======================================================\n")

if __name__ == '__main__':
    seed_database()
