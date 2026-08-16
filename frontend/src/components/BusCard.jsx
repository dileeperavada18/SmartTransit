import React from 'react';
import { Bus, User, MapPin, Users, Navigation } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const BusCard = ({ bus, onSelect, onAction, actionLabel = 'Track Bus' }) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md group hover:shadow-indigo-500/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 group-hover:text-cyan-400 group-hover:scale-105 transition-transform">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              Bus {bus.bus_number}
              <span className="text-xs text-slate-400 font-mono font-normal">
                ({bus.registration_number || 'N/A'})
              </span>
            </h3>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{bus.route_name || 'No Route Assigned'}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={bus.status} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">{bus.driver_name || 'No Driver'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>{bus.capacity || 45} Seats</span>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(bus)}
          className="w-full mt-4 py-2 px-3 bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5 text-indigo-400" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
