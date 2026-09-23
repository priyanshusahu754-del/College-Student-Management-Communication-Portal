import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Filter, Activity } from 'lucide-react';
import api from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs?per_page=100');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error("Logs fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => (
        <div className="text-xs">
          <p className="font-mono text-slate-700 font-semibold">{new Date(row.created_at).toLocaleDateString()}</p>
          <p className="text-[10px] text-slate-400 font-mono">{new Date(row.created_at).toLocaleTimeString()}</p>
        </div>
      )
    },
    {
      header: 'Actor',
      accessor: 'actor_name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs">{row.actor_name}</p>
          <p className="text-[10px] text-slate-400">{row.actor_email || 'System'}</p>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          {row.action}
        </span>
      )
    },
    {
      header: 'Target Entity',
      accessor: 'entity_type',
      render: (row) => (
        <span className="text-xs text-slate-600 capitalize">
          {row.entity_type} {row.entity_id ? `(#${row.entity_id})` : ''}
        </span>
      )
    },
    {
      header: 'Sanitized Metadata',
      accessor: 'metadata',
      render: (row) => (
        <span className="font-mono text-[10px] text-slate-500 truncate max-w-xs block">
          {row.metadata || 'N/A'}
        </span>
      )
    }
  ];

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Security & Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">Immutable chronological records of administrative events, logins, and operational changes</p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchKey="action"
        searchPlaceholder="Search audit actions (e.g. USER_LOGIN, ATTENDANCE_MARKED)..."
        pageSize={15}
      />
    </div>
  );
};
