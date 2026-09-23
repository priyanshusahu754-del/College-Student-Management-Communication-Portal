import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-slate-800/80 border border-slate-700 p-8 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">403</h1>
        <h2 className="text-lg font-bold text-slate-200 mb-2">Access Forbidden</h2>
        <p className="text-xs text-slate-400 mb-6">
          You do not have the required permissions or role to access this resource.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Safety</span>
        </Link>
      </div>
    </div>
  );
};
