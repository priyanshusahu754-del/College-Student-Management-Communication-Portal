import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, Filter, HardDrive } from 'lucide-react';
import api from '../../services/api';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const StudyMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials');
      if (res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error("Materials load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const response = await api.get(`/materials/download/${material.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download file or file not found.");
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={6} />;
  }

  const subjects = Array.from(new Set(materials.map(m => m.subject_code).filter(Boolean)));

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          (m.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || m.subject_code === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Verified Study Materials & Notes</h1>
          <p className="text-xs text-slate-500 mt-1">Download lecture handouts, syllabus blueprints, and reference slides</p>
        </div>

        {/* Search & Subject Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes & slides..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  {mat.file_type || 'PDF'}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold text-indigo-600">
                {mat.subject_code} · {mat.subject_name}
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-2">{mat.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{mat.description || 'Verified course resource file.'}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By: {mat.uploader_name || 'Faculty'}</span>
                <span>{(mat.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDownload(mat)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Resource</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
