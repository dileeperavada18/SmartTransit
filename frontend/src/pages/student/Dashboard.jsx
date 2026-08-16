import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { busService, routeService, incidentService, notificationService } from '../../services/api';
import { BusCard } from '../../components/BusCard';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Bus, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Navigation, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  Bell
} from 'lucide-react';

export const StudentDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [busesRes, routesRes, notifsRes] = await Promise.all([
          busService.getAll(),
          routeService.getAll(),
          notificationService.getAll()
        ]);
        setBuses(busesRes.data.buses || []);
        setRoutes(routesRes.data.routes || []);
        setActiveAlerts((notifsRes.data.notifications || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/60 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 rounded-lg">
            Passenger Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Live Transit & Real-Time Tracking
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Track college buses live on OpenStreetMap, check stop arrival times, report transport delays or breakdowns, and receive instant replacement bus updates.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              to="/student/tracking"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Live Bus Tracking Map
            </Link>
            <Link
              to="/student/report-incident"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Report Issue / Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Live Replacement or Breakdown Banners */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm ${
                alert.type === 'breakdown'
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  : alert.type === 'replacement'
                  ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <Bell className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">{alert.title}</div>
                <div className="mt-0.5 text-xs opacity-90">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Fleet Buses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-indigo-400" /> Active Campus Buses
            </h2>
            <p className="text-xs text-slate-400">Real-time status of all active fleet routes</p>
          </div>
          <Link
            to="/student/tracking"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View Live Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
              actionLabel="Track This Bus"
              onSelect={() => window.location.href = `/student/tracking?bus_id=${bus.id}`}
            />
          ))}
        </div>
      </div>

      {/* Transit Routes Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" /> College Routes & Stop Sequences
            </h2>
            <p className="text-xs text-slate-400">Regular college pickup and drop routes</p>
          </div>
          <Link
            to="/student/routes"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All Route Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    {route.route_name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>From: <strong>{route.start_point}</strong></span>
                    <span>To: <strong>{route.destination}</strong></span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {route.estimated_time || 30} mins
                </span>
              </div>

              {/* Stop breadcrumbs */}
              <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                {route.stops && route.stops.map((s, idx) => (
                  <React.Fragment key={s.id || idx}>
                    <span className="text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      {s.stop_name}
                    </span>
                    {idx < (route.stops.length - 1) && (
                      <span className="text-slate-600 text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
