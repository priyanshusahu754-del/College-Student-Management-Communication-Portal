import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, HardDrive, Database, Server, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';

export const SystemSettings = () => {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await api.get('/health');
      if (res.data) {
        setHealth(res.data.data);
      }
    } catch (err) {
      setHealth({ status: 'offline', database: 'disconnected' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Infrastructure & Diagnostics</h1>
          <p className="text-xs text-slate-500 mt-1">Core services status, database connectivity, and environment configurations</p>
        </div>

        <button
          onClick={checkHealth}
          disabled={checking}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>Refresh Health Probe</span>
        </button>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">REST API Server</span>
            <Badge variant="emerald">Operational</Badge>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">Flask 3.x</p>
          <p className="text-[11px] text-slate-400">Application Factory Pattern</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Relational Database</span>
            <Badge variant={health?.database === 'healthy' ? 'emerald' : 'rose'}>
              {health?.database || 'Checking...'}
            </Badge>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">MySQL 8+ / SQLite</p>
          <p className="text-[11px] text-slate-400">SQLAlchemy ORM + Foreign Keys</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Security Engine</span>
            <Badge variant="indigo">Protected</Badge>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">JWT Extended</p>
          <p className="text-[11px] text-slate-400">Role-Based Access Control</p>
        </div>
      </div>

      {/* Infrastructure Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Platform Deployment Parameters</h2>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            v1.0.0-PROD
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400">Frontend Engine</span>
            <p className="font-bold text-slate-800">React 18 + Vite 5 + Tailwind CSS</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400">Backend Runtime</span>
            <p className="font-bold text-slate-800">Python 3.14 + Flask + Gunicorn</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400">Max Upload Limit</span>
            <p className="font-bold text-slate-800">16 MB per file (PDF, DOCX, ZIP, PPT)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400">Session Strategy</span>
            <p className="font-bold text-slate-800">Bearer Token with 24h Expiry Window</p>
          </div>
        </div>
      </div>
    </div>
  );
};
