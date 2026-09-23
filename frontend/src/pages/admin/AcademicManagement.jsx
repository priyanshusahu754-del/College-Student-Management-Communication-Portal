// React hooks import kar rahe hain
import React, { useEffect, useState } from 'react';
// Lucide icons
import { Building2, FolderKanban, BookOpen, Plus, Trash2, UserPlus, CheckCircle2 } from 'lucide-react';
// Axios API service
import api from '../../services/api';
// Reusable UI components: Modal, AlertBanner, ConfirmDialog, LoadingSkeleton
import { Modal } from '../../components/common/Modal';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

// Academic Curriculum, Departments, Courses & Faculty Allocation Manager Component (Admin ERP)
export const AcademicManagement = () => {
  // Active navigation tab (departments, courses, subjects, assignments, enrollments)
  const [activeTab, setActiveTab] = useState('departments');
  // Loading aur notification banner states
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Core academic data lists
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Department Modal Form States
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Degree Course Modal Form States
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDeptId, setCourseDeptId] = useState('');

  // Syllabus Subject Modal Form States
  const [subjModalOpen, setSubjModalOpen] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjCourseId, setSubjCourseId] = useState('');
  const [subjSem, setSubjSem] = useState(1);
  const [subjCredits, setSubjCredits] = useState(4);

  // Faculty Allocation Modal Form States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');

  // Student Enrollment Modal Form States
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollSubjectId, setEnrollSubjectId] = useState('');

  // Component mount hone par saara academic data parallel fetch kar rahe hain
  useEffect(() => {
    fetchAllData();
  }, []);

  // Backend se saare modules ka data simultaneously load karne ka function
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Promise.all se 7 parallel requests bhej rahe hain fast loading ke liye
      const [deptRes, crsRes, subRes, tRes, sRes, taRes, enrRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/subjects'),
        api.get('/users?role=teacher&per_page=100'),
        api.get('/users?role=student&per_page=100'),
        api.get('/teacher-assignments'),
        api.get('/enrollments')
      ]);

      // Departments populate kar rahe hain
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
        if (deptRes.data.data.length > 0) setCourseDeptId(deptRes.data.data[0].id);
      }
      // Courses populate kar rahe hain
      if (crsRes.data.success) {
        setCourses(crsRes.data.data);
        if (crsRes.data.data.length > 0) setSubjCourseId(crsRes.data.data[0].id);
      }
      // Subjects populate kar rahe hain
      if (subRes.data.success) {
        setSubjects(subRes.data.data);
        if (subRes.data.data.length > 0) {
          setAssignSubjectId(subRes.data.data[0].id);
          setEnrollSubjectId(subRes.data.data[0].id);
        }
      }
      // Teachers populate kar rahe hain
      if (tRes.data.success) {
        setTeachers(tRes.data.data);
        if (tRes.data.data.length > 0 && tRes.data.data[0].teacher_profile) {
          setAssignTeacherId(tRes.data.data[0].teacher_profile.id);
        }
      }
      // Students populate kar rahe hain
      if (sRes.data.success) {
        setStudents(sRes.data.data);
        if (sRes.data.data.length > 0 && sRes.data.data[0].student_profile) {
          setEnrollStudentId(sRes.data.data[0].student_profile.id);
        }
      }
      // Faculty allocations aur Student enrollments set kar rahe hain
      if (taRes.data.success) setTeacherAssignments(taRes.data.data);
      if (enrRes.data.success) setEnrollments(enrRes.data.data);
    } catch (err) {
      console.error("Academics fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Naya Department save karne ka function
  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/departments', { name: deptName, code: deptCode, description: deptDesc });
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Department created successfully' });
        setDeptModalOpen(false);
        setDeptName('');
        setDeptCode('');
        setDeptDesc('');
        fetchAllData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    }
  };

  // Naya Degree Course add karne ka function
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', { name: courseName, code: courseCode, department_id: parseInt(courseDeptId) });
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Degree program created successfully' });
        setCourseModalOpen(false);
        setCourseName('');
        setCourseCode('');
        fetchAllData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    }
  };

  // Naya Syllabus Subject create karne ka function
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/subjects', {
        name: subjName,
        code: subjCode,
        course_id: parseInt(subjCourseId),
        semester: parseInt(subjSem),
        credits: parseInt(subjCredits)
      });
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Subject created successfully' });
        setSubjModalOpen(false);
        setSubjName('');
        setSubjCode('');
        fetchAllData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    }
  };

  // Faculty ko Subject assign karne ka function
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teacher-assignments', {
        teacher_id: parseInt(assignTeacherId),
        subject_id: parseInt(assignSubjectId),
        academic_year: '2024-2025',
        semester: 5
      });
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Teacher assigned to subject successfully' });
        setAssignModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Assignment failed' });
    }
  };

  // Student ko Subject me enroll karne ka function
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/enrollments', {
        student_id: parseInt(enrollStudentId),
        subject_id: parseInt(enrollSubjectId),
        academic_year: '2024-2025',
        semester: 5
      });
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Student enrolled in subject successfully' });
        setEnrollModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Enrollment failed' });
    }
  };

  // Initial loading placeholder
  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  // Component UI Layout
  return (
    <div className="space-y-8">
      {/* Page Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Academic Curriculum & Allocations</h1>
          <p className="text-xs text-slate-500 mt-1">Configure departments, degree courses, syllabus subjects, and teacher allocations</p>
        </div>

        {/* Tab-Specific Action Buttons */}
        {activeTab === 'departments' && (
          <button onClick={() => setDeptModalOpen(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Department</span>
          </button>
        )}
        {activeTab === 'courses' && (
          <button onClick={() => setCourseModalOpen(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Course</span>
          </button>
        )}
        {activeTab === 'subjects' && (
          <button onClick={() => setSubjModalOpen(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add Subject</span>
          </button>
        )}
        {activeTab === 'assignments' && (
          <button onClick={() => setAssignModalOpen(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Assign Faculty to Course</span>
          </button>
        )}
        {activeTab === 'enrollments' && (
          <button onClick={() => setEnrollModalOpen(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2">
            <UserPlus className="w-4 h-4" /> <span>Enroll Student</span>
          </button>
        )}
      </div>

      {/* Alert Banner */}
      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Tabs Navigation Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
        {[
          { id: 'departments', label: `Departments (${departments.length})` },
          { id: 'courses', label: `Degree Programs (${courses.length})` },
          { id: 'subjects', label: `Curriculum Subjects (${subjects.length})` },
          { id: 'assignments', label: `Faculty Allocations (${teacherAssignments.length})` },
          { id: 'enrollments', label: `Student Enrollments (${enrollments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Departments Grid */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200">
                  {d.code}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-3">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">{d.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{d.students_count || 0} Students</span>
                <span>{d.teachers_count || 0} Faculty</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Degree Courses Grid */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-200">
                  {c.code}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-3">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Dept: {c.department_name}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{c.semester_count} Semesters</span>
                <span>{c.academic_year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Curriculum Subjects Table */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Subject Name</th>
                <th className="px-5 py-3.5">Degree Course</th>
                <th className="px-5 py-3.5 text-center">Semester</th>
                <th className="px-5 py-3.5 text-center">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600">{sub.code}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{sub.name}</td>
                  <td className="px-5 py-4 text-slate-600">{sub.course_name}</td>
                  <td className="px-5 py-4 text-center font-bold text-slate-700">Sem {sub.semester}</td>
                  <td className="px-5 py-4 text-center font-bold text-slate-700">{sub.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Faculty Allocations Table */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Assigned Faculty</th>
                <th className="px-5 py-3.5">Subject Code</th>
                <th className="px-5 py-3.5">Subject Name</th>
                <th className="px-5 py-3.5">Academic Session</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherAssignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-bold text-slate-800">{a.teacher_name}</td>
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600">{a.subject_code}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{a.subject_name}</td>
                  <td className="px-5 py-4 text-slate-500">{a.academic_year} (Sem {a.semester})</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={async () => {
                        await api.delete(`/teacher-assignments/${a.id}`);
                        fetchAllData();
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Student Enrollments Table */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Enrollment No.</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Subject Code</th>
                <th className="px-5 py-3.5">Subject Name</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-mono font-bold text-slate-700">{e.enrollment_number}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{e.student_name}</td>
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600">{e.subject_code}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{e.subject_name}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px]">
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={async () => {
                        await api.delete(`/enrollments/${e.id}`);
                        fetchAllData();
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Unenroll"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Modal Popup */}
      <Modal isOpen={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Add Department" maxWidth="max-w-md">
        <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Department Name</label>
            <input type="text" required value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g., Mechanical Engineering" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Department Code</label>
            <input type="text" required value={deptCode} onChange={(e) => setDeptCode(e.target.value.toUpperCase())} placeholder="e.g., ME" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea rows={3} value={deptDesc} onChange={(e) => setDeptDesc(e.target.value)} placeholder="Overview of the department..." className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={() => setDeptModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Save</button>
          </div>
        </form>
      </Modal>

      {/* Course Modal Popup */}
      <Modal isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} title="Add Degree Course" maxWidth="max-w-md">
        <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Course Name</label>
            <input type="text" required value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g., B.Tech Information Technology" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Course Code</label>
            <input type="text" required value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} placeholder="e.g., BT-IT" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Department</label>
            <select value={courseDeptId} onChange={(e) => setCourseDeptId(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
              {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={() => setCourseModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Save</button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal Popup */}
      <Modal isOpen={subjModalOpen} onClose={() => setSubjModalOpen(false)} title="Add Syllabus Subject" maxWidth="max-w-md">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Subject Name</label>
            <input type="text" required value={subjName} onChange={(e) => setSubjName(e.target.value)} placeholder="e.g., Machine Learning & AI" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Subject Code</label>
            <input type="text" required value={subjCode} onChange={(e) => setSubjCode(e.target.value.toUpperCase())} placeholder="e.g., CS401" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Degree Course</label>
              <select value={subjCourseId} onChange={(e) => setSubjCourseId(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                {courses.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Semester</label>
              <input type="number" min="1" max="8" value={subjSem} onChange={(e) => setSubjSem(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
            </div>
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={() => setSubjModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Save</button>
          </div>
        </form>
      </Modal>

      {/* Faculty Allocation Modal Popup */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Faculty to Course" maxWidth="max-w-md">
        <form onSubmit={handleAssignTeacher} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Faculty</label>
            <select value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
              {teachers.map(t => (
                <option key={t.id} value={t.teacher_profile?.id}>{t.full_name} ({t.teacher_profile?.employee_id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Select Subject</label>
            <select value={assignSubjectId} onChange={(e) => setAssignSubjectId(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={() => setAssignModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Assign</button>
          </div>
        </form>
      </Modal>

      {/* Student Enrollment Modal Popup */}
      <Modal isOpen={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} title="Enroll Student in Subject" maxWidth="max-w-md">
        <form onSubmit={handleEnrollStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Student</label>
            <select value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
              {students.map(s => (
                <option key={s.id} value={s.student_profile?.id}>{s.full_name} ({s.student_profile?.enrollment_number})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Select Subject</label>
            <select value={enrollSubjectId} onChange={(e) => setEnrollSubjectId(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={() => setEnrollModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Enroll</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

