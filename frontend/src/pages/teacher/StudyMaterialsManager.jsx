import React, { useEffect, useState } from 'react';
import { Plus, FileText, Download, Trash2, Search, HardDrive } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { FileUploadDropzone } from '../../components/common/FileUploadDropzone';
import { AlertBanner } from '../../components/common/AlertBanner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const StudyMaterialsManager = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const teacherId = user?.teacher_profile?.id;
      const [matRes, subjRes] = await Promise.all([
        api.get('/materials'),
        api.get(`/teacher-assignments?teacher_id=${teacherId || ''}`)
      ]);

      if (matRes.data.success) setMaterials(matRes.data.data);
      if (subjRes.data.success) {
        setSubjects(subjRes.data.data);
        if (subjRes.data.data.length > 0) {
          setSubjectId(subjRes.data.data[0].subject_id);
        }
      }
    } catch (err) {
      console.error("Materials load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setAlert({ type: 'error', message: 'Please attach a document file' });
      return;
    }

    setUploading(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject_id', subjectId);
      formData.append('file', selectedFile);

      const res = await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: 'Study material published successfully!' });
        setUploadModalOpen(false);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/materials/${deleteTarget.id}`);
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Resource removed successfully' });
        setDeleteTarget(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const response = await api.get(`/materials/download/${material.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download file");
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={4} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Study Materials Repository</h1>
          <p className="text-xs text-slate-500 mt-1">Upload and manage lecture presentations, PDF notes, and reference books</p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Materials Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Resource Name</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">File Format</th>
                <th className="px-5 py-3.5">File Size</th>
                <th className="px-5 py-3.5">Upload Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{mat.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{mat.description || mat.file_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600">{mat.subject_code}</td>
                  <td className="px-5 py-4 uppercase font-bold text-slate-500">{mat.file_type}</td>
                  <td className="px-5 py-4 text-slate-500">{(mat.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                  <td className="px-5 py-4 text-slate-500">{new Date(mat.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownload(mat)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(mat)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Verified Lecture Material"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Subject</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unit 4 - Concurrency & Deadlocks Complete Lecture Handout"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of syllabus topics covered in this document..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <FileUploadDropzone
            selectedFile={selectedFile}
            onFileSelect={(f) => setSelectedFile(f)}
            onFileRemove={() => setSelectedFile(null)}
            label="Upload Document (PDF, DOCX, PPTX, ZIP)"
          />

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Publish Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Study Material"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Resource"
        isDestructive={true}
        loading={deleting}
      />
    </div>
  );
};
