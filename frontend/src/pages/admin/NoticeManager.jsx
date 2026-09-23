import React, { useEffect, useState } from 'react';
import { Plus, Bell, Trash2, Edit3, Calendar } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const NoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [expiresAt, setExpiresAt] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNotices();
    fetchDepartments();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error("Notices load error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.error("Dept load error", err);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setAlert(null);

    try {
      const payload = {
        title,
        content,
        audience,
        priority,
        target_department_id: audience === 'department' && targetDeptId ? parseInt(targetDeptId) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
      };

      const res = await api.post('/notices', payload);
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Notice circular published successfully!' });
        setCreateModalOpen(false);
        setTitle('');
        setContent('');
        fetchNotices();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Publishing failed' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/notices/${deleteTarget.id}`);
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Notice deleted successfully' });
        setDeleteTarget(null);
        fetchNotices();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    } finally {
      setDeleting(false);
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
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Official Circulars & Notice Management</h1>
          <p className="text-xs text-slate-500 mt-1">Broadcast high-priority institutional notices with role & department targeting</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Notices Grid */}
      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant={n.priority}>{n.priority}</Badge>
                <span className="text-xs font-semibold text-slate-500">
                  Target Audience: <strong className="text-slate-800 uppercase font-mono">{n.audience}</strong>
                  {n.target_department_name && ` (${n.target_department_name})`}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Published {new Date(n.published_at).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-800">{n.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">By: {n.author_name}</span>
              <button
                onClick={() => setDeleteTarget(n)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-bold">Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast Institutional Notice"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Schedule for Mid-Term Examinations Fall 2025"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="all">Entire Campus (All Users)</option>
                <option value="students">Students Only</option>
                <option value="teachers">Faculty Only</option>
                <option value="department">Specific Department</option>
              </select>
            </div>
          </div>

          {audience === 'department' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Department</label>
              <select
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">Select target branch...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Body Content</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type official notification body text..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={publishing}
              className="px-5 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteNotice}
        title="Remove Official Notice"
        message={`Are you sure you want to delete notice "${deleteTarget?.title}"?`}
        confirmText="Delete Notice"
        isDestructive={true}
        loading={deleting}
      />
    </div>
  );
};
