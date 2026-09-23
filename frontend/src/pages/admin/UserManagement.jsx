import React, { useEffect, useState } from 'react';
import { Plus, Users, Search, Filter, ShieldCheck, UserX, UserCheck, Edit3 } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable } from '../../components/common/DataTable';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  // Departments & Courses for student/teacher creation
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Student-specific fields
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState(1);
  const [admissionYear, setAdmissionYear] = useState(2024);

  // Teacher-specific fields
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('');

  const [creating, setCreating] = useState(false);
  const [statusToggleTarget, setStatusToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMetadata();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `/users?per_page=50`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Users fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses')
      ]);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
        if (deptRes.data.data.length > 0) setDepartmentId(deptRes.data.data[0].id);
      }
      if (courseRes.data.success) {
        setCourses(courseRes.data.data);
        if (courseRes.data.data.length > 0) setCourseId(courseRes.data.data[0].id);
      }
    } catch (err) {
      console.error("Metadata load error", err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setAlert(null);

    try {
      const payload = {
        full_name: fullName,
        email,
        password,
        role,
        phone,
      };

      if (role === 'student') {
        payload.enrollment_number = enrollmentNo;
        payload.department_id = parseInt(departmentId);
        payload.course_id = parseInt(courseId);
        payload.current_semester = parseInt(semester);
        payload.admission_year = parseInt(admissionYear);
      } else if (role === 'teacher') {
        payload.employee_id = employeeId;
        payload.department_id = parseInt(departmentId);
        payload.designation = designation;
        payload.qualification = qualification;
      }

      const res = await api.post('/users', payload);
      if (res.data.success) {
        setAlert({ type: 'success', message: `Account created successfully for ${fullName}` });
        setCreateModalOpen(false);
        // Reset form
        setFullName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setEnrollmentNo('');
        setEmployeeId('');
        fetchUsers();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusToggleTarget) return;
    setToggling(true);
    try {
      const res = await api.patch(`/users/${statusToggleTarget.id}/status`);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setStatusToggleTarget(null);
        fetchUsers();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Status update failed' });
    } finally {
      setToggling(false);
    }
  };

  const columns = [
    {
      header: 'User / Identity',
      accessor: 'full_name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=6366f1&color=fff`}
            alt={row.full_name}
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.full_name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <Badge variant={row.role === 'admin' ? 'rose' : row.role === 'teacher' ? 'indigo' : 'emerald'}>
          {row.role}
        </Badge>
      )
    },
    {
      header: 'Profile Details',
      accessor: 'id',
      render: (row) => {
        if (row.role === 'student' && row.student_profile) {
          return (
            <div className="text-[11px] text-slate-600">
              <span className="font-mono font-bold text-slate-800">{row.student_profile.enrollment_number}</span> · {row.student_profile.department_code} (Sem {row.student_profile.current_semester})
            </div>
          );
        }
        if (row.role === 'teacher' && row.teacher_profile) {
          return (
            <div className="text-[11px] text-slate-600">
              <span className="font-mono font-bold text-slate-800">{row.teacher_profile.employee_id}</span> · {row.teacher_profile.designation}
            </div>
          );
        }
        return <span className="text-[11px] text-slate-400">System Admin</span>;
      }
    },
    {
      header: 'Account Status',
      accessor: 'is_active',
      render: (row) => (
        <Badge variant={row.is_active ? 'active' : 'inactive'}>
          {row.is_active ? 'Active' : 'Deactivated'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusToggleTarget(row)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              row.is_active 
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
            }`}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Campus User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage credentials, enrollments, and lifecycle for students, faculty, and admins</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Faculty</option>
          <option value="admin">Administrators</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Accounts</option>
          <option value="inactive">Deactivated Accounts</option>
        </select>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="full_name"
        searchPlaceholder="Search by student or faculty name..."
        pageSize={12}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New Campus User Account"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">User Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    role === r
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ananya Deshmukh"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campusconnect.edu"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Student Profile Attributes */}
          {role === 'student' && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900">Student Academic Enrollment Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    required
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value.toUpperCase())}
                    placeholder="e.g., CS2024001"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Degree Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Admission Year</label>
                  <input
                    type="number"
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Faculty Profile Attributes */}
          {role === 'teacher' && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900">Faculty Academic Designation</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g., FAC-CS-09"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g., Associate Professor"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g., Ph.D. in CS"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              {creating ? 'Creating Account...' : 'Provision User Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!statusToggleTarget}
        onClose={() => setStatusToggleTarget(null)}
        onConfirm={handleToggleStatus}
        title={statusToggleTarget?.is_active ? "Deactivate User Account" : "Activate User Account"}
        message={`Are you sure you want to ${statusToggleTarget?.is_active ? 'deactivate' : 'activate'} ${statusToggleTarget?.full_name}'s portal access?`}
        confirmText={statusToggleTarget?.is_active ? "Confirm Deactivation" : "Confirm Activation"}
        isDestructive={statusToggleTarget?.is_active}
        loading={toggling}
      />
    </div>
  );
};
