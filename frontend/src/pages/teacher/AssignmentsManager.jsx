import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Users, CheckCircle2, Award, Download, Clock, FileText, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FileUploadDropzone } from '../../components/common/FileUploadDropzone';
import { AlertBanner } from '../../components/common/AlertBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AssignmentsManager = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [selectedFile, setSelectedFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Submissions Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const teacherId = user?.teacher_profile?.id;
      const [asgnRes, subjRes] = await Promise.all([
        api.get('/assignments'),
        api.get(`/teacher-assignments?teacher_id=${teacherId || ''}`)
      ]);

      if (asgnRes.data.success) setAssignments(asgnRes.data.data);
      if (subjRes.data.success) {
        setSubjects(subjRes.data.data);
        if (subjRes.data.data.length > 0) {
          setSubjectId(subjRes.data.data[0].subject_id);
        }
      }
    } catch (err) {
      console.error("Assignments manager load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject_id', subjectId);
      formData.append('due_date', new Date(dueDate).toISOString());
      formData.append('total_marks', totalMarks);
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const res = await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: 'Assignment created and published successfully!' });
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleOpenSubmissions = async (asgn) => {
    setSelectedAssignment(asgn);
    setSubmissionsModalOpen(true);
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/assignments/${asgn.id}/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error("Submissions load error", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGrade = (sub) => {
    setSelectedSubmission(sub);
    setMarks(sub.marks !== null ? sub.marks : '');
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setGrading(true);

    try {
      const res = await api.patch(`/assignments/submissions/${selectedSubmission.id}/grade`, {
        marks: parseFloat(marks),
        feedback
      });

      if (res.data.success) {
        setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? res.data.data : s));
        setSelectedSubmission(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Grading failed");
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Assignment Management & Grading</h1>
          <p className="text-xs text-slate-500 mt-1">Publish new course assignments and evaluate student submissions</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((asgn) => (
          <div
            key={asgn.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
                  {asgn.subject_code}
                </span>
                <Badge variant={asgn.status}>{asgn.status}</Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-800 leading-snug">{asgn.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{asgn.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                <p>Subject: <span className="font-semibold text-slate-700">{asgn.subject_name}</span></p>
                <p>Total Marks: <span className="font-semibold text-slate-700">{asgn.total_marks}</span></p>
                <p>Due: <span className="font-semibold text-slate-700">{new Date(asgn.due_date).toLocaleDateString()}</span></p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {asgn.submissions_count || 0} Submissions
              </span>
              <button
                onClick={() => handleOpenSubmissions(asgn)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Review & Grade
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Course Assignment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.subject_id}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Assignment 3: Relational Algebra & Indexing"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Statement / Instructions</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type assignment guidelines, problem description, submission format requirements..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date & Time</label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <FileUploadDropzone
            selectedFile={selectedFile}
            onFileSelect={(f) => setSelectedFile(f)}
            onFileRemove={() => setSelectedFile(null)}
            label="Attach Reference Material / PDF (Optional)"
          />

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
              {creating ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions Review Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={submissionsModalOpen}
          onClose={() => {
            setSubmissionsModalOpen(false);
            setSelectedSubmission(null);
          }}
          title={`Submissions: ${selectedAssignment.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {loadingSubmissions ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading submissions...</p>
            ) : submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Enrollment</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Score</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-700">{sub.enrollment_number}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">{sub.student_name}</td>
                        <td className="px-4 py-3.5 text-slate-500">{new Date(sub.submitted_at).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge variant={sub.status}>{sub.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-indigo-600">
                          {sub.marks !== null ? `${sub.marks} / ${selectedAssignment.total_marks}` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenGrade(sub)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-all"
                          >
                            {sub.marks !== null ? 'Re-Grade' : 'Grade Solution'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No student submissions received yet.</p>
            )}

            {/* Inline Grading Drawer / Box */}
            {selectedSubmission && (
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-200/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-900">
                    Grading for: {selectedSubmission.student_name} ({selectedSubmission.enrollment_number})
                  </h4>
                  <button onClick={() => setSelectedSubmission(null)} className="text-indigo-400 hover:text-indigo-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Student Answer Notes:</p>
                  <div className="p-3 bg-white rounded-xl text-xs text-slate-700 border border-slate-200 max-h-28 overflow-y-auto">
                    {selectedSubmission.submission_text || 'No text submitted.'}
                  </div>
                </div>

                <form onSubmit={handleSaveGrade} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Award Marks (Max: {selectedAssignment.total_marks})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min="0"
                      max={selectedAssignment.total_marks}
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center space-x-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Feedback / Remarks</label>
                      <input
                        type="text"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g., Excellent schema design and constraints"
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={grading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex-shrink-0 disabled:opacity-50"
                    >
                      {grading ? 'Saving...' : 'Save Grade'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
