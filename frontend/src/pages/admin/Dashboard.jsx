import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, busService, incidentService } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { 
  Bus, 
  AlertTriangle, 
  Route as RouteIcon, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Users, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analyticsRes, busesRes, incidentsRes] = await Promise.all([
          analyticsService.getDashboardStats(),
          busService.getAll(),
          incidentService.getAll()
        ]);
        setStats(analyticsRes.data);
        setBuses(busesRes.data.buses || []);
        setRecentIncidents((incidentsRes.data.incidents || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const fleet = stats?.fleet || {};
  const incidentStats = stats?.incidents || {};

  return (
    <div className="space-y-6">
      
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-500/20 shadow-xl">
        <div>
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-purple-400 bg-purple-950/80 border border-purple-800/60 rounded-lg">
            Transport Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Fleet Operations & Incident Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time public transit tracking, incident triage, and automated replacement bus orchestration
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/incidents"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Manage Incidents ({incidentStats.open || 0})
          </Link>
          <Link
            to="/admin/delay-predict"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            AI Sandbox
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Buses */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Fleet</span>
            <Bus className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{fleet.total_buses || 5}</div>
          <div className="text-[10px] text-slate-500 mt-1">Registered vehicles</div>
        </div>

        {/* Active Buses */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/30 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>Active On Route</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{fleet.active_buses || 3}</div>
          <div className="text-[10px] text-slate-400 mt-1">Normal operation</div>
        </div>

        {/* Delayed Buses */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-900/30 shadow-md">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span>Delayed Fleet</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">{fleet.delayed_buses || 1}</div>
          <div className="text-[10px] text-slate-400 mt-1">Schedule impacted</div>
        </div>

        {/* Breakdown Buses */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-900/40 shadow-md">
          <div className="flex items-center justify-between text-rose-400 text-xs">
            <span>Breakdowns</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2 font-mono">{fleet.breakdown_buses || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Needs replacement</div>
        </div>

        {/* Replacement Active */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-900/30 shadow-md">
          <div className="flex items-center justify-between text-cyan-400 text-xs">
            <span>Replacements</span>
            <Layers className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2 font-mono">{fleet.replacement_buses || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Dispatched standby</div>
        </div>

        {/* Open Incidents */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 shadow-md">
          <div className="flex items-center justify-between text-purple-400 text-xs">
            <span>Open Incidents</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 mt-2 font-mono">{incidentStats.open || 1}</div>
          <div className="text-[10px] text-slate-400 mt-1">{incidentStats.high_priority || 0} High Priority</div>
        </div>

      </div>

      {/* Grid: Live Fleet Overview & Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Fleet Status Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bus className="w-5 h-5 text-indigo-400" /> Live Fleet Status & Driver Assignments
              </h2>
              <p className="text-xs text-slate-400">Current status and route bindings across all buses</p>
            </div>
            <Link
              to="/admin/buses"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Manage Fleet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Bus Number</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-100 font-mono">
                      Bus {bus.bus_number}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {bus.route_name || <span className="text-slate-500 italic">Standby Fleet</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {bus.driver_name || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bus.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <Link
                        to="/admin/buses"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Urgent Incident Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Recent Incidents
            </h2>
            <Link
              to="/admin/incidents"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                All transit systems running smoothly with zero open incidents.
              </div>
            ) : (
              recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      #{inc.id} {inc.incident_type}
                    </span>
                    <PriorityBadge priority={inc.priority} />
                  </div>
                  <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                    "{inc.description}"
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Bus {inc.bus_number || 'N/A'}</span>
                    <span className={`font-bold ${inc.status === 'Open' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {inc.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
