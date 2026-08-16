import React, { useState, useEffect } from 'react';
import { busService, incidentService } from '../../services/api';
import { Layers, Bus, ArrowRight, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminReplacementBuses = () => {
  const [buses, setBuses] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [busesRes, incRes] = await Promise.all([
        busService.getAll(),
        incidentService.getAll()
      ]);
      setBuses(busesRes.data.buses || []);
      setIncidents(incRes.data.incidents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const replacementBuses = buses.filter(b => b.status === 'Replacement');
  const breakdownBuses = buses.filter(b => b.status === 'Breakdown');

  const handleRevertBus = async (busId) => {
    try {
      await busService.updateStatus(busId, 'Active');
      setStatusMsg('Vehicle status restored to Active duty');
      loadData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-cyan-400" /> Replacement Bus Operations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor standby vehicle redeployments, breakdown substitutions, and fleet restoration
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Grid: Active Replacements vs Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Replacement Deployments */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-cyan-400" /> Active Replacement Deployments ({replacementBuses.length})
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-mono">
              Live Fleet
            </span>
          </div>

          <div className="space-y-3">
            {replacementBuses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                No replacement buses currently dispatched. All routes operating with original vehicles.
              </div>
            ) : (
              replacementBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      Bus {bus.bus_number}
                      <StatusBadge status="Replacement" size="sm" />
                    </div>
                    <div className="text-slate-400 mt-1">
                      Assigned to: <strong>{bus.route_name || 'Active Route'}</strong>
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      Driver: {bus.driver_name || 'Standby Operator'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevertBus(bus.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return to Standby
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vehicles in Breakdown / Maintenance */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-rose-400" /> Immobilized / Breakdown Vehicles ({breakdownBuses.length})
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60 font-mono">
              Needs Repair
            </span>
          </div>

          <div className="space-y-3">
            {breakdownBuses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                Zero vehicle breakdowns detected. Fleet is 100% operational.
              </div>
            ) : (
              breakdownBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      Bus {bus.bus_number}
                      <StatusBadge status="Breakdown" size="sm" />
                    </div>
                    <div className="text-slate-400 mt-1">
                      Origin Route: <strong>{bus.route_name || 'Campus Route'}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevertBus(bus.id)}
                    className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/40 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Repaired & Active
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
