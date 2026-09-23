import React, { useEffect, useState } from 'react';
import { BookOpen, UploadCloud, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FileUploadDropzone } from '../../components/common/FileUploadDropzone';
import { AlertBanner } from '../../components/common/AlertBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, submitted
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Submission form state
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error("Assignments fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (asgn) => {
    setSelectedAssignment(asgn);
    setSubmissionText(asgn.my_submission?.submission_text || '');
    setSelectedFile(null);
    setSubmissionModalOpen(true);
  };

  const handleOpenFeedback = (asgn) => {
    setSelectedAssignment(asgn);
    setFeedbackModalOpen(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('submission_text', submissionText);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await api.post(`/assignments/${selectedAssignment.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: 'Assignment submitted successfully!' });
        setSubmissionModalOpen(false);
        fetchAssignments();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  const filteredAssignments = assignments.filter((asgn) => {
    if (activeTab === 'pending') return !asgn.my_submission;
    if (activeTab === 'submitted') return !!asgn.my_submission;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Assignments & Lab Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Submit coursework solutions and view faculty evaluation feedback</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          {[
            { id: 'all', label: `All (${assignments.length})` },
            { id: 'pending', label: `Pending (${assignments.filter(a => !a.my_submission).length})` },
            { id: 'submitted', label: `Submitted (${assignments.filter(a => !!a.my_submission).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((asgn) => {
          const submission = asgn.my_submission;
          const isOverdue = new Date() > new Date(asgn.due_date);

          return (
            <div
              key={asgn.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {asgn.subject_code}
                  </span>
                  {submission ? (
                    <Badge variant={submission.status === 'graded' ? 'emerald' : 'sky'}>
                      {submission.status}
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="rose">Overdue</Badge>
                  ) : (
                    <Badge variant="amber">Due Soon</Badge>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-800 leading-snug">{asgn.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{asgn.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Subject:</span>
                    <span className="font-semibold text-slate-700">{asgn.subject_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Marks:</span>
                    <span className="font-semibold text-slate-700">{asgn.total_marks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Due Date:</span>
                    <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                      {new Date(asgn.due_date).toLocaleDateString()} at {new Date(asgn.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {submission ? (
                  <>
                    <button
                      onClick={() => handleOpenFeedback(asgn)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      {submission.status === 'graded' ? `View Grade (${submission.marks}/${asgn.total_marks})` : 'View Submission'}
                    </button>
                    <button
                      onClick={() => handleOpenSubmit(asgn)}
                      className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenSubmit(asgn)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Submit Solution</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={submissionModalOpen}
          onClose={() => setSubmissionModalOpen(false)}
          title={`Submit: ${selectedAssignment.title}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Answer Description / Solution Notes
              </label>
              <textarea
                rows={4}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your solution summary, github links, or explanation here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <FileUploadDropzone
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file)}
              onFileRemove={() => setSelectedFile(null)}
              label="Attach Document or Archive (PDF, ZIP, DOCX)"
            />

            <div className="pt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSubmissionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? <span>Uploading...</span> : <span>Confirm Submission</span>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Grade & Feedback Modal */}
      {selectedAssignment && selectedAssignment.my_submission && (
        <Modal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          title="Submission & Grading Review"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Evaluation Status:</span>
                <Badge variant={selectedAssignment.my_submission.status}>
                  {selectedAssignment.my_submission.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Marks Awarded:</span>
                <span className="text-lg font-bold text-indigo-600">
                  {selectedAssignment.my_submission.marks !== null ? `${selectedAssignment.my_submission.marks} / ${selectedAssignment.total_marks}` : 'Pending Evaluation'}
                </span>
              </div>
              {selectedAssignment.my_submission.graded_by_name && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Evaluator:</span>
                  <span className="font-semibold text-slate-700">{selectedAssignment.my_submission.graded_by_name}</span>
                </div>
              )}
            </div>

            {selectedAssignment.my_submission.feedback && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
                <p className="text-xs font-bold text-emerald-800 mb-1">Teacher Feedback:</p>
                <p className="text-xs text-emerald-900 leading-relaxed italic">
                  "{selectedAssignment.my_submission.feedback}"
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Your Submission Content:</p>
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 max-h-32 overflow-y-auto">
                {selectedAssignment.my_submission.submission_text || 'No text submitted.'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
