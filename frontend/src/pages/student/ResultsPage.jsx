import React, { useEffect, useState } from 'react';
import { Award, GraduationCap, Printer, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const ResultsPage = () => {
  const [examGroups, setExamGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamIndex, setSelectedExamIndex] = useState(0);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/results/my-results');
      if (res.data.success) {
        setExamGroups(res.data.data);
      }
    } catch (err) {
      console.error("Results fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={4} />;
  }

  const activeExam = examGroups.length > 0 ? examGroups[selectedExamIndex] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Academic Results & Grade Cards</h1>
          <p className="text-xs text-slate-500 mt-1">Official semester transcripts, course-wise marks, and CGPA evaluations</p>
        </div>

        {examGroups.length > 0 && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center space-x-2 transition-all self-start"
          >
            <Printer className="w-4 h-4" />
            <span>Print Marksheet</span>
          </button>
        )}
      </div>

      {examGroups.length > 0 ? (
        <>
          {/* Exam Selection Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {examGroups.map((exam, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedExamIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedExamIndex === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {exam.examination_name} (Sem {exam.semester})
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          {activeExam && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                title="Aggregate Marks"
                value={`${activeExam.total_obtained} / ${activeExam.total_maximum}`}
                subtitle="Total Marks Secured"
                icon={Award}
                color="indigo"
              />
              <StatCard
                title="Overall Percentage"
                value={`${activeExam.overall_percentage}%`}
                subtitle="Calculated Across All Subjects"
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Cumulative CGPA"
                value={`${activeExam.cgpa} / 10`}
                subtitle="10-Point Scale Equivalent"
                icon={GraduationCap}
                color="purple"
              />
            </div>
          )}

          {/* Grade Card Sheet */}
          {activeExam && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-800">{activeExam.examination_name}</h2>
                  <p className="text-xs text-slate-400">Statement of Grades · Semester {activeExam.semester}</p>
                </div>
                <Badge variant="emerald" size="lg">Official Result Released</Badge>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Subject Code</th>
                      <th className="px-4 py-3">Course / Subject Name</th>
                      <th className="px-4 py-3 text-center">Credits</th>
                      <th className="px-4 py-3 text-center">Max Marks</th>
                      <th className="px-4 py-3 text-center">Marks Obtained</th>
                      <th className="px-4 py-3 text-center">Percentage</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeExam.subjects.map((sub, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600">{sub.subject_code}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800 text-xs">{sub.subject_name}</td>
                        <td className="px-4 py-3.5 text-center text-xs font-bold text-slate-700">{sub.credits}</td>
                        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500">{sub.maximum_marks}</td>
                        <td className="px-4 py-3.5 text-center text-xs font-bold text-slate-800">{sub.marks_obtained}</td>
                        <td className="px-4 py-3.5 text-center text-xs font-bold text-indigo-600">{sub.percentage}%</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-lg">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 italic">{sub.remarks || 'Satisfactory'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No examination results published yet.</p>
          <p className="text-xs text-slate-400 mt-1">Official marks will appear once published by the Examination Cell.</p>
        </div>
      )}
    </div>
  );
};
