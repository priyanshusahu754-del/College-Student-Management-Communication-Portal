import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Award, 
  Users, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const teacherId = user?.teacher_profile?.id;
      const [assignRes, asgnRes, notRes] = await Promise.all([
        api.get(`/teacher-assignments?teacher_id=${teacherId || ''}`),
        api.get('/assignments'),
        api.get('/notices'),
      ]);

      if (assignRes.data.success) setAssignedSubjects(assignRes.data.data);
      if (asgnRes.data.success) setAssignments(asgnRes.data.data);
      if (notRes.data.success) setNotices(notRes.data.data.slice(0, 3));
    } catch (err) {
      console.error("Teacher dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  const profile = user?.teacher_profile;
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissions_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* Faculty Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <span>{profile?.designation} · {profile?.department_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.full_name} 👨‍🏫
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Employee ID: <span className="font-mono font-bold text-white">{profile?.employee_id}</span> · Academic Year: 2024-2025
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/teacher/attendance"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link
              to="/teacher/assignments"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Assignment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Subjects"
          value={assignedSubjects.length}
          subtitle="Courses Taught This Semester"
          icon={FolderKanban}
          color="indigo"
        />
        <StatCard
          title="Active Coursework"
          value={assignments.length}
          subtitle="Assignments & Projects"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Student Submissions"
          value={totalSubmissions}
          subtitle="Total Received Solutions"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Department Faculty"
          value={profile?.designation || 'Professor'}
          subtitle={profile?.department_code || 'CSE'}
          icon={Users}
          color="sky"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: My Assigned Subjects */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">My Teaching Subjects</h2>
                <p className="text-xs text-slate-400">Academic Year 2024-2025 · Semester 5</p>
              </div>
              <Link to="/teacher/subjects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                <span>All Subjects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignedSubjects.map((sub) => (
                <div key={sub.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {sub.subject_code}
                      </span>
                      <span className="text-[10px] text-slate-400">Sem {sub.semester}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-2">{sub.subject_name}</h3>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <Link
                      to="/teacher/attendance"
                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-center rounded-lg text-xs font-semibold transition-all"
                    >
                      Attendance
                    </Link>
                    <Link
                      to="/teacher/results"
                      className="flex-1 py-1.5 bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-center rounded-lg text-xs font-semibold transition-all"
                    >
                      Marks Entry
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Assignments Management */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Published Coursework</h2>
                <p className="text-xs text-slate-400">Manage student submissions and grading</p>
              </div>
              <Link to="/teacher/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {assignments.map((asgn) => (
                <div key={asgn.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">{asgn.subject_code}</span>
                    <p className="text-xs font-bold text-slate-800">{asgn.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Due: {new Date(asgn.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                      {asgn.submissions_count || 0} Submissions
                    </span>
                    <Link
                      to="/teacher/assignments"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Grade
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Notices */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">Faculty Shortcuts</h2>
            <div className="space-y-2">
              <Link
                to="/teacher/attendance"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Record Attendance</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/teacher/materials"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-bold text-slate-700">Upload Study Material</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/teacher/results"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Submit Exam Marks</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Department Notices */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">Faculty Circulars</h2>
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <Badge variant={n.priority} size="sm">{n.priority}</Badge>
                  <p className="text-xs font-bold text-slate-800 mt-1">{n.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
