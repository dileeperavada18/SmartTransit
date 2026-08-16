import React, { useState, useEffect } from 'react';
import { incidentService } from '../../services/api';
import { Clock, CheckCircle2, AlertTriangle, Bus, Wrench } from 'lucide-react';
import { PriorityBadge } from '../../components/StatusBadge';

export const DriverAssignedTasks = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await incidentService.getAll();
      // Show incidents that are Open or In Progress
      setIncidents(res.data.incidents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleResolve = async (incidentId) => {
    try {
      await incidentService.updateStatus(incidentId, 'Resolved');
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'Resolved' } : inc));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Clock className="w-6 h-6 text-amber-400" /> Assigned Maintenance & Incident Tasks
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Vehicle breakdown recovery, route clearance tasks, and maintenance orders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Task #{inc.id}: {inc.incident_type}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">Bus {inc.bus_number || 'N/A'} • {inc.route_name || 'Campus Route'}</div>
                </div>
              </div>
              <PriorityBadge priority={inc.priority} />
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
              "{inc.description}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                inc.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                Status: {inc.status}
              </span>

              {inc.status !== 'Resolved' && (
                <button
                  onClick={() => handleResolve(inc.id)}
                  className="px-3.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mark Task Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
