import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, UserCheck, Award, BookOpen, FileText } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const MySubjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const teacherId = user?.teacher_profile?.id;
      const res = await api.get(`/teacher-assignments?teacher_id=${teacherId || ''}`);
      if (res.data.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error("Subjects fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Assigned Subjects & Curriculum</h1>
        <p className="text-xs text-slate-500 mt-1">Official teaching allocations for Academic Year 2024-2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200">
                  {sub.subject_code}
                </span>
                <span className="text-xs font-semibold text-slate-400">Semester {sub.semester}</span>
              </div>

              <h2 className="text-base font-bold text-slate-800">{sub.subject_name}</h2>
              <p className="text-xs text-slate-500 mt-1">Academic Year: {sub.academic_year}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/teacher/attendance"
                className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Attendance</span>
              </Link>
              <Link
                to="/teacher/results"
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center space-x-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Marks</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
