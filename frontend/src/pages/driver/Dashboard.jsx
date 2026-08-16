import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { busService, routeService, incidentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Bus, 
  Radio, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Navigation,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [openIncidents, setOpenIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const busesRes = await busService.getAll();
        // Find bus assigned to current driver user id, or default to B12
        const myBus = busesRes.data.buses.find(b => b.driver_id === user?.id) || 
                      busesRes.data.buses.find(b => b.bus_number === 'B12') || 
                      busesRes.data.buses[0];

        setAssignedBus(myBus);
        if (myBus?.route_id) {
          const routeRes = await routeService.getById(myBus.route_id);
          setAssignedRoute(routeRes.data.route);
        }

        const incRes = await incidentService.getAll({ status: 'Open' });
        setOpenIncidents((incRes.data.incidents || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load driver dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDriverData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Driver Cockpit Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/60 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-amber-400 bg-amber-950/80 border border-amber-800/60 rounded-lg">
              Driver Cockpit
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Welcome back, {user?.name || 'Driver'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Assigned Vehicle: <strong className="text-amber-300">Bus {assignedBus?.bus_number || 'B12'}</strong> | Status: <StatusBadge status={assignedBus?.status} size="sm" />
            </p>
          </div>

          <Link
            to="/driver/trip-control"
            className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-amber-600/30 flex items-center gap-2 self-start sm:self-auto transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            Open GPS Trip Control
          </Link>
        </div>
      </div>

      {/* Grid: Vehicle & Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Assigned Bus Status */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-400" /> Vehicle Status & Telemetry
            </h2>
            <StatusBadge status={assignedBus?.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">BUS NUMBER</span>
              <span className="text-slate-100 font-bold text-sm">Bus {assignedBus?.bus_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">REGISTRATION</span>
              <span className="text-slate-100 font-bold text-sm">{assignedBus?.registration_number || 'AP-39-T-1212'}</span>
            </div>
            <div className="mt-2">
              <span className="text-slate-500 block text-[10px]">SEATING CAPACITY</span>
              <span className="text-slate-200">{assignedBus?.capacity || 50} Passengers</span>
            </div>
            <div className="mt-2">
              <span className="text-slate-500 block text-[10px]">CURRENT GPS SPEED</span>
              <span className="text-emerald-400 font-bold">{assignedBus?.latest_location?.speed || 35} km/h</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/driver/trip-control"
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              Broadcast GPS
            </Link>
            <Link
              to="/driver/report-incident"
              className="flex-1 py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/60 flex items-center justify-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Report Issue
            </Link>
          </div>
        </div>

        {/* Assigned Route & Stops */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" /> Assigned Transit Route
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 font-mono">
              {assignedRoute?.estimated_time || 30} mins
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-200 text-sm">{assignedRoute?.route_name || 'No Route Assigned'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Start: <strong>{assignedRoute?.start_point}</strong> → Destination: <strong>{assignedRoute?.destination}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">Route Waypoints ({assignedRoute?.stops?.length || 0} stops):</div>
            <div className="flex flex-wrap gap-1.5">
              {assignedRoute?.stops?.map((s, idx) => (
                <span key={s.id || idx} className="text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  {idx + 1}. {s.stop_name}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
