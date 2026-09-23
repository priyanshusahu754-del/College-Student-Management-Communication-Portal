import React from 'react';

export const LoadingSkeleton = ({ type = 'cards', count = 3 }) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="h-12 bg-slate-100 border-b border-slate-200" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-slate-300 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
      ))}
    </div>
  );
};
