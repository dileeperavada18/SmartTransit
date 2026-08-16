import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'delayed':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'breakdown':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30 radar-alert';
      case 'replacement':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'out of service':
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700';
    }
  };

  const getDotColor = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-400';
      case 'delayed':
        return 'bg-amber-400';
      case 'breakdown':
        return 'bg-rose-400 animate-ping';
      case 'replacement':
        return 'bg-cyan-400';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getStyle()} ${sizeClass}`}>
      <span className={`w-2 h-2 rounded-full ${getDotColor()}`} />
      {status || 'Unknown'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getStyle = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border ${getStyle()}`}>
      {priority} Priority
    </span>
  );
};
