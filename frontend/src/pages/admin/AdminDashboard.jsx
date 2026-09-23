import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  BookOpen, 
  UserCheck, 
  ShieldCheck, 
  Bell, 
  Calendar, 
  FolderKanban, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/audit-logs?per_page=5')
      ]);

      if (statsRes.data.success) setAnalytics(statsRes.data.data);
      if (logsRes.data.success) setRecentLogs(logsRes.data.data);
    } catch (err) {
      console.error("Admin overview fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  const totals = analytics?.totals || {};
  const deptData = analytics?.department_distribution || [];
  
  const roleChartData = [
    { name: 'Students', value: totals.students || 0, color: '#6366f1' },
    { name: 'Faculty', value: totals.teachers || 0, color: '#10b981' },
    { name: 'Admins', value: totals.admins || 1, color: '#f43f5e' },
  ];

  const submissionStats = analytics?.submissions_stats || {};
  const submissionChartData = [
    { name: 'Graded', value: submissionStats.graded || 0, color: '#10b981' },
    { name: 'Pending Review', value: submissionStats.pending || 0, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Institutional ERP Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time database metrics across departments, academic records, and security logs</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </Link>
          <Link
            to="/admin/notices"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>Broadcast Notice</span>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={totals.students || 0}
          subtitle="Enrolled in B.Tech Programs"
          icon={Users}
          color="indigo"
          onClick={() => {}}
        />
        <StatCard
          title="Faculty Members"
          value={totals.teachers || 0}
          subtitle="Professors & Instructors"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Academic Departments"
          value={totals.departments || 0}
          subtitle={`${totals.courses || 0} Degree Programs`}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Avg Attendance Rate"
          value={`${totals.avg_attendance_rate || 0}%`}
          subtitle="Across All Current Semesters"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Department Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Department Enrollment Matrix</h2>
              <p className="text-xs text-slate-400">Students and Faculty distribution by Engineering Branch</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Live DB
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="department_code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="student_count" name="Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="teacher_count" name="Faculty" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: User Role Donut Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Campus User Demographics</h2>
            <p className="text-xs text-slate-400">Total Active Accounts: {totals.active_users || 0}</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
            <div>
              <p className="font-bold text-indigo-600">{totals.students || 0}</p>
              <p className="text-[10px] text-slate-400">Students</p>
            </div>
            <div>
              <p className="font-bold text-emerald-600">{totals.teachers || 0}</p>
              <p className="text-[10px] text-slate-400">Faculty</p>
            </div>
            <div>
              <p className="font-bold text-rose-600">{totals.admins || 1}</p>
              <p className="text-[10px] text-slate-400">Admins</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Audit Log Stream & System Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Audit Log Ticker (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-800">Security & Operational Audit Stream</h2>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
              <span>Full Audit Trail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 font-mono">{log.action}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Actor: <span className="font-semibold text-slate-700">{log.actor_name}</span> · Entity: {log.entity_type} #{log.entity_id || 'N/A'}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <p>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>{new Date(log.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Modules */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">ERP Administrative Hub</h2>
          
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">User Lifecycle & Roles</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/academics"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-bold text-slate-700">Departments & Courses</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/events"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Campus Events & Fests</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold text-slate-700">System Health & Config</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
