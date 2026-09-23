import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  BookOpen, 
  Award, 
  Calendar, 
  Bell, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [attRes, asgnRes, notRes, evRes, resRes] = await Promise.all([
          api.get('/attendance/student-summary'),
          api.get('/assignments'),
          api.get('/notices'),
          api.get('/events'),
          api.get('/results/my-results'),
        ]);

        if (attRes.data.success) setAttendanceSummary(attRes.data.data);
        if (asgnRes.data.success) setAssignments(asgnRes.data.data);
        if (notRes.data.success) setNotices(notRes.data.data.slice(0, 3));
        if (evRes.data.success) setEvents(evRes.data.data.slice(0, 3));
        if (resRes.data.success) setResults(resRes.data.data);
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  const studentProfile = user?.student_profile;
  const overallAtt = attendanceSummary?.overall_percentage ?? 100;
  const isAttWarning = overallAtt < 75;

  const pendingAssignments = assignments.filter(a => !a.my_submission);
  const latestExam = results.length > 0 ? results[0] : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-700/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
              <GraduationCap className="w-4 h-4" />
              <span>{studentProfile?.course_name || 'B.Tech Program'} · Semester {studentProfile?.current_semester || 1}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl leading-relaxed">
              Enrollment: <span className="font-mono font-bold text-white">{studentProfile?.enrollment_number}</span> · Department: {studentProfile?.department_name}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/student/assignments"
              className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              View Assignments ({pendingAssignments.length} Pending)
            </Link>
          </div>
        </div>
      </div>

      {/* 75% Attendance Alert if Critical */}
      {isAttWarning && (
        <div className="flex items-center space-x-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="text-xs">
            <span className="font-bold">Attendance Warning:</span> Your overall attendance is {overallAtt}%, which is below the mandatory 75% threshold. Please attend upcoming lectures to maintain examination eligibility.
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${overallAtt}%`}
          subtitle={`${attendanceSummary?.total_attended || 0} of ${attendanceSummary?.total_sessions || 0} classes attended`}
          icon={UserCheck}
          color={isAttWarning ? 'rose' : 'emerald'}
          trend={{ positive: !isAttWarning, text: isAttWarning ? 'Below 75%' : 'Eligible', label: 'criteria' }}
        />
        <StatCard
          title="Pending Submissions"
          value={pendingAssignments.length}
          subtitle={`${assignments.length} total active tasks`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Cumulative CGPA"
          value={latestExam?.cgpa ? `${latestExam.cgpa} / 10` : '9.2 / 10'}
          subtitle={latestExam ? latestExam.examination_name : 'Mid-Term Assessment'}
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Campus Events"
          value={events.length}
          subtitle="Upcoming fests & workshops"
          icon={Calendar}
          color="sky"
        />
      </div>

      {/* Main Grid: Subject Attendance & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Subject Attendance Bars */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Subject-Wise Attendance</h2>
                <p className="text-xs text-slate-400">Current Semester Breakdown</p>
              </div>
              <Link to="/student/attendance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                <span>Detailed Logs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {attendanceSummary?.subject_summaries?.length > 0 ? (
                attendanceSummary.subject_summaries.map((sub) => {
                  const isLow = sub.percentage < 75.0;
                  return (
                    <div key={sub.subject_id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{sub.subject_name}</span>
                          <span className="text-[10px] font-mono text-slate-400 ml-2">({sub.subject_code})</span>
                        </div>
                        <span className={`text-xs font-bold ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {sub.percentage}% ({sub.present_count}/{sub.total_sessions})
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, sub.percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No subject attendance records found.</p>
              )}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Active Coursework & Tasks</h2>
                <p className="text-xs text-slate-400">Assignments requiring submission</p>
              </div>
              <Link to="/student/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 3).map((asgn) => (
                <div key={asgn.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                  <div className="overflow-hidden pr-4">
                    <p className="text-xs font-bold text-slate-800 truncate">{asgn.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{asgn.subject_name} · Due {new Date(asgn.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    {asgn.my_submission ? (
                      <Badge variant={asgn.my_submission.status === 'graded' ? 'emerald' : 'sky'} size="sm">
                        {asgn.my_submission.status}
                      </Badge>
                    ) : (
                      <Link
                        to="/student/assignments"
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all"
                      >
                        Submit
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Notices & Upcoming Events */}
        <div className="space-y-8">
          {/* Urgent Notices */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Official Notices</h2>
              </div>
              <Link to="/student/notices" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                All
              </Link>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={n.priority} size="sm">{n.priority}</Badge>
                    <span className="text-[10px] text-slate-400">{new Date(n.published_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{n.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Campus Events */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Campus Events</h2>
              </div>
              <Link to="/student/events" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{ev.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">📍 {ev.venue}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-indigo-600 font-medium">{new Date(ev.start_datetime).toLocaleDateString()}</span>
                    {ev.is_registered ? (
                      <Badge variant="emerald" size="sm">Registered</Badge>
                    ) : (
                      <Link to="/student/events" className="text-[10px] text-indigo-600 font-bold hover:underline">
                        Register →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
