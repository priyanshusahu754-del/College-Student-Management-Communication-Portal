import React, { useEffect, useState } from 'react';
import { Bell, Search, Filter, AlertCircle, Calendar } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    fetchNotices();
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

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || n.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Official Circulars & Notice Board</h1>
          <p className="text-xs text-slate-500 mt-1">Authorized campus announcements, exam notifications, and institutional updates</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="space-y-4">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant={n.priority} size="md">{n.priority}</Badge>
                <span className="text-xs font-bold text-slate-400">· Audience: {n.audience}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Published {new Date(n.published_at).toLocaleDateString()}</span>
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-800">{n.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Author: {n.author_name}</span>
              {n.expires_at && <span>Valid until: {new Date(n.expires_at).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
