import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend, onClick }) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/60',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-200/60',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
    sky: 'bg-sky-500/10 text-sky-600 border-sky-200/60',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200/60',
  };

  const iconBg = colorMap[color] || colorMap.indigo;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl border ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
          {trend.label && <span className="text-slate-400 ml-1.5">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
