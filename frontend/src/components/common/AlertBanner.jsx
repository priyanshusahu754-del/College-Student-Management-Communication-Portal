import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const AlertBanner = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const typeConfig = {
    info: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: Info,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: AlertCircle,
    },
  };

  const { bg, icon: Icon } = typeConfig[type] || typeConfig.info;

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${bg} ${className}`}>
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
