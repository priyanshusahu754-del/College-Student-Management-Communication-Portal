import React, { useEffect, useState } from 'react';
import { Award, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner } from '../../components/common/AlertBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const ResultsManager = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');

  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const teacherId = user?.teacher_profile?.id;
      const [subjRes, examRes] = await Promise.all([
        api.get(`/teacher-assignments?teacher_id=${teacherId || ''}`),
        api.get('/results/examinations')
      ]);

      if (subjRes.data.success && subjRes.data.data.length > 0) {
        setSubjects(subjRes.data.data);
        setSelectedSubjectId(subjRes.data.data[0].subject_id);
      }
      if (examRes.data.success && examRes.data.data.length > 0) {
        setExaminations(examRes.data.data);
        setSelectedExamId(examRes.data.data[0].id);
      }
    } catch (err) {
      console.error("Results manager load error", err);
    }
  };

  const handleLoadRoster = async () => {
    if (!selectedSubjectId || !selectedExamId) return;
    setLoading(true);
    setAlert(null);

    try {
      const res = await api.get(`/results/subject-roster?subject_id=${selectedSubjectId}&examination_id=${selectedExamId}`);
      if (res.data.success) {
        setRoster(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to load student roster' });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks, maxMarks) => {
    if (!marks || !maxMarks || maxMarks <= 0) return '';
    const pct = (parseFloat(marks) / parseFloat(maxMarks)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    if (pct >= 40) return 'E';
    return 'F';
  };

  const handleMarksChange = (studentId, value) => {
    setRoster(prev => prev.map(item => {
      if (item.student_id === studentId) {
        const grade = calculateGrade(value, item.maximum_marks || 100);
        return { ...item, marks_obtained: value, grade };
      }
      return item;
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    setRoster(prev => prev.map(item => {
      if (item.student_id === studentId) {
        return { ...item, remarks: value };
      }
      return item;
    }));
  };

  const handleSaveResults = async () => {
    setSaving(true);
    setAlert(null);

    try {
      const validResults = roster
        .filter(r => r.marks_obtained !== '' && r.marks_obtained !== null)
        .map(r => ({
          student_id: r.student_id,
          marks_obtained: parseFloat(r.marks_obtained),
          maximum_marks: parseFloat(r.maximum_marks || 100),
          remarks: r.remarks || ''
        }));

      const res = await api.post('/results/bulk-entry', {
        examination_id: parseInt(selectedExamId),
        subject_id: parseInt(selectedSubjectId),
        results: validResults
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message || 'Marks saved successfully!' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save marks' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Examination Marks Entry</h1>
        <p className="text-xs text-slate-500 mt-1">
          Record mid-term, practical, and semester assessment marks for enrolled students
        </p>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Select Exam & Subject */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Select Assessment & Course</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Examination</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {examinations.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Subject</label>
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
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleLoadRoster}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Award className="w-4 h-4" />
            <span>{loading ? 'Loading Roster...' : 'Load Student Grade Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Marks Spreadsheet Grid */}
      {roster.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800">Student Grade Matrix</h2>
              <p className="text-xs text-slate-400">Total Enrolled: {roster.length} Students · Grade calculated automatically</p>
            </div>
            <button
              onClick={handleSaveResults}
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Submit Official Marks'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Enrollment No.</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3 text-center">Max Marks</th>
                  <th className="px-4 py-3 text-center w-32">Marks Obtained</th>
                  <th className="px-4 py-3 text-center">Calculated Grade</th>
                  <th className="px-4 py-3">Remarks / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((st) => (
                  <tr key={st.student_id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-700">{st.enrollment_number}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{st.student_name}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-500">{st.maximum_marks || 100}</td>
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={st.maximum_marks || 100}
                        value={st.marks_obtained}
                        onChange={(e) => handleMarksChange(st.student_id, e.target.value)}
                        placeholder="0.0"
                        className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-lg">
                        {st.grade || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="text"
                        value={st.remarks || ''}
                        onChange={(e) => handleRemarksChange(st.student_id, e.target.value)}
                        placeholder="e.g., Excellent analytical skills"
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
