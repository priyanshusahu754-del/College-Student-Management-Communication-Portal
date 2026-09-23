// React hooks import kar rahe hain
import React, { useEffect, useState } from 'react';
// Lucide icons
import { UserCheck, CheckCircle2, XCircle, Clock, AlertCircle, Save, Calendar, BookOpen } from 'lucide-react';
// Axios API service
import api from '../../services/api';
// Auth context
import { useAuth } from '../../context/AuthContext';
// Reusable common UI components
import { Badge } from '../../components/common/Badge';
import { AlertBanner } from '../../components/common/AlertBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

// Faculty Attendance Marking Manager Component
export const AttendanceManager = () => {
  // Current logged-in teacher details
  const { user } = useAuth();
  // State variables: subjects list, selected subject, date, lecture topic
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  
  // Active session and student roster list states
  const [activeSession, setActiveSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Mount hone par teacher ke assigned subjects load karte hain
  useEffect(() => {
    fetchTeacherSubjects();
  }, []);

  // Teacher ke assigned subjects API se fetch karne ka function
  const fetchTeacherSubjects = async () => {
    try {
      const teacherId = user?.teacher_profile?.id;
      const res = await api.get(`/teacher-assignments?teacher_id=${teacherId || ''}`);
      if (res.data.success && res.data.data.length > 0) {
        setSubjects(res.data.data);
        setSelectedSubjectId(res.data.data[0].subject_id);
      }
    } catch (err) {
      console.error("Failed to load subjects", err);
    }
  };

  // Naya session initialize karne ya existing date ka session load karne ka function
  const handleLoadOrCreateSession = async (e) => {
    e?.preventDefault();
    if (!selectedSubjectId || !sessionDate) return;

    setLoading(true);
    setAlert(null);
    try {
      // 1. Backend me session create ya retrieve kar rahe hain
      const createRes = await api.post('/attendance/sessions', {
        subject_id: parseInt(selectedSubjectId),
        session_date: sessionDate,
        topic: topic || 'Regular Lecture'
      });

      if (createRes.data.success) {
        const session = createRes.data.data;
        setActiveSession(session);

        // 2. Session ka complete enrolled student roster fetch kar rahe hain
        const rosterRes = await api.get(`/attendance/session/${session.id}`);
        if (rosterRes.data.success) {
          setRoster(rosterRes.data.data.roster || []);
          if (rosterRes.data.data.topic) setTopic(rosterRes.data.data.topic);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to initialize attendance session' });
    } finally {
      setLoading(false);
    }
  };

  // Kisi student ka attendance status (Present, Absent, Late, Excused) change karne ka handler
  const handleStatusChange = (studentId, status) => {
    setRoster(prev => prev.map(r => r.student_id === studentId ? { ...r, status } : r));
  };

  // Rapid Action: Saare students ko ek saath Present ya Absent mark karna
  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(r => ({ ...r, status })));
  };

  // Marked attendance records ko database me bulk save karne ka function
  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    setSaving(true);
    setAlert(null);

    try {
      const payload = {
        session_id: activeSession.id,
        records: roster.map(r => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks || ''
        }))
      };

      const res = await api.post('/attendance/records', payload);
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Attendance records saved successfully!' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  // UI JSX Layout
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Attendance Register</h1>
        <p className="text-xs text-slate-500 mt-1">
          Create lecture sessions and record present, absent, late, or excused statuses for enrolled students
        </p>
      </div>

      {/* Alert Banner */}
      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Session Initialization Controls Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Select Subject & Lecture Session</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.subject_id}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lecture Topic (Optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Transaction Isolation Levels"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Load Class Register Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleLoadOrCreateSession}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'Loading...' : 'Load Class Register'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Student Roster Grid */}
      {roster.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {/* Header & Rapid Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Class Attendance Roster ({roster.length} Enrolled Students)
              </h2>
              <p className="text-xs text-slate-400">Date: {sessionDate} · Topic: {topic || 'Regular Classroom Session'}</p>
            </div>

            {/* Quick Bulk Marking Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all"
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all"
              >
                ✗ Mark All Absent
              </button>
            </div>
          </div>

          {/* Student Table with Interactive Toggle Badges */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Enrollment No.</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3 text-center">Attendance Status</th>
                  <th className="px-4 py-3">Optional Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((st) => (
                  <tr key={st.student_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{st.enrollment_number}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 text-xs">{st.student_name}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center space-x-1.5">
                        {[
                          { id: 'present', label: 'Present', color: 'bg-emerald-600 text-white' },
                          { id: 'absent', label: 'Absent', color: 'bg-rose-600 text-white' },
                          { id: 'late', label: 'Late', color: 'bg-amber-600 text-white' },
                          { id: 'excused', label: 'Excused', color: 'bg-sky-600 text-white' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, btn.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              st.status === btn.id
                                ? btn.color + ' shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="text"
                        value={st.remarks || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRoster(prev => prev.map(r => r.student_id === st.student_id ? { ...r, remarks: val } : r));
                        }}
                        placeholder="e.g., Late arrival with pass"
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Save and Summary Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Present: <span className="font-bold text-emerald-600">{roster.filter(r => r.status === 'present').length}</span> · 
              Absent: <span className="font-bold text-rose-600 ml-1">{roster.filter(r => r.status === 'absent').length}</span> · 
              Late: <span className="font-bold text-amber-600 ml-1">{roster.filter(r => r.status === 'late').length}</span>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Records...' : 'Save & Submit Attendance'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

