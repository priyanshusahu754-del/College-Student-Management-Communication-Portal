import React from 'react';

export const Badge = ({ children, variant = 'slate', size = 'md' }) => {
  const variantMap = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    // Status aliases
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    absent: 'bg-rose-50 text-rose-700 border-rose-200',
    late: 'bg-amber-50 text-amber-700 border-amber-200',
    excused: 'bg-sky-50 text-sky-700 border-sky-200',
    submitted: 'bg-sky-50 text-sky-700 border-sky-200',
    graded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    urgent: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
    high: 'bg-amber-100 text-amber-800 border-amber-300',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const sizeMap = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg',
    lg: 'text-sm px-3 py-1.5 rounded-lg',
  };

  const selectedVariant = variantMap[variant?.toLowerCase()] || variantMap.slate;
  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <span className={`inline-flex items-center font-medium border capitalize ${selectedVariant} ${selectedSize}`}>
      {children}
    </span>
  );
};
