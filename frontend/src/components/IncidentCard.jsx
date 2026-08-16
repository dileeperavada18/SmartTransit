import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Bus, 
  Sparkles, 
  User, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { PriorityBadge } from './StatusBadge';

export const IncidentCard = ({ 
  incident, 
  onAssignStaff, 
  onAssignReplacement, 
  onResolve, 
  isAdmin = false 
}) => {
  const getStatusColor = () => {
    switch (incident.status?.toLowerCase()) {
      case 'open':
        return 'border-amber-500/40 bg-amber-500/5';
      case 'in progress':
        return 'border-indigo-500/40 bg-indigo-500/5';
      case 'resolved':
        return 'border-emerald-500/40 bg-emerald-500/5 opacity-75';
      default:
        return 'border-slate-800 bg-slate-900/60';
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all shadow-md ${getStatusColor()}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            incident.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>Incident #{incident.id}: {incident.incident_type}</span>
              <PriorityBadge priority={incident.priority} />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
              <span>Reported by: {incident.reporter_name || 'Passenger'} ({incident.reporter_role || 'user'})</span>
              <span>•</span>
              <span>{incident.created_at ? new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
            </div>
          </div>
        </div>

        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
          incident.status === 'Open' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
          incident.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }`}>
          {incident.status}
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
        "{incident.description}"
      </p>

      {/* Bus and Route Info */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
        {incident.bus_number && (
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Bus className="w-3.5 h-3.5" />
            <span className="font-semibold">Bus {incident.bus_number}</span>
          </div>
        )}
        {incident.route_name && (
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{incident.route_name}</span>
          </div>
        )}
        {incident.ai_category && (
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-700/40">
            <Sparkles className="w-3 h-3" />
            <span className="text-[11px] font-medium">AI Triage: {incident.ai_category} ({Math.round((incident.ai_confidence || 0.85)*100)}%)</span>
          </div>
        )}
      </div>

      {/* Assignments or Replacements info */}
      {incident.replacements && incident.replacements.length > 0 && (
        <div className="mt-3 p-2 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-xs text-cyan-200 flex items-center gap-2">
          <Bus className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Replacement bus <strong>{incident.replacements[0].replacement_bus_number}</strong> active for Bus <strong>{incident.replacements[0].original_bus_number}</strong>
          </span>
        </div>
      )}

      {/* Admin Action Buttons */}
      {isAdmin && incident.status !== 'Resolved' && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          {onAssignStaff && (
            <button
              onClick={() => onAssignStaff(incident)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              Assign Staff
            </button>
          )}

          {onAssignReplacement && (
            <button
              onClick={() => onAssignReplacement(incident)}
              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold rounded-lg border border-indigo-500/40 transition-colors flex items-center gap-1.5"
            >
              <Bus className="w-3.5 h-3.5 text-cyan-400" />
              Assign Replacement Bus
            </button>
          )}

          {onResolve && (
            <button
              onClick={() => onResolve(incident.id)}
              className="ml-auto px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-500/40 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
};
