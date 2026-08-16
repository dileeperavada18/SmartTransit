import React, { useState, useEffect } from 'react';
import { busService, routeService, trackingService, incidentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Radio, 
  Play, 
  Square, 
  AlertTriangle, 
  MapPin, 
  Navigation, 
  Clock, 
  Bus, 
  CheckCircle2,
  FastForward,
  Activity
} from 'lucide-react';

export const DriverTripControl = () => {
  const { user } = useAuth();
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [tripActive, setTripActive] = useState(false);
  const [autoSimulating, setAutoSimulating] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 16.5650, longitude: 82.0150, speed: 35 });
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBus = async () => {
      try {
        const busesRes = await busService.getAll();
        const myBus = busesRes.data.buses.find(b => b.driver_id === user?.id) || 
                      busesRes.data.buses.find(b => b.bus_number === 'B12') || 
                      busesRes.data.buses[0];

        setAssignedBus(myBus);
        if (myBus?.route_id) {
          const routeRes = await routeService.getById(myBus.route_id);
          setAssignedRoute(routeRes.data.route);
          if (routeRes.data.route?.stops?.length > 0) {
            const firstStop = routeRes.data.route.stops[0];
            setCurrentLocation({
              latitude: firstStop.latitude,
              longitude: firstStop.longitude,
              speed: 35
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBus();
  }, [user]);

  // Broadcast location packet to backend
  const broadcastLocation = async (lat, lng, speed = 35) => {
    if (!assignedBus) return;
    try {
      await trackingService.updateLocation({
        bus_id: assignedBus.id,
        latitude: lat,
        longitude: lng,
        speed: speed,
        heading: 45.0
      });
      setCurrentLocation({ latitude: lat, longitude: lng, speed });
    } catch (err) {
      console.error('Failed to broadcast location:', err);
    }
  };

  // Step to next stop waypoint
  const handleNextStop = async () => {
    if (!assignedRoute?.stops || assignedRoute.stops.length === 0) return;
    const nextIdx = (currentStopIndex + 1) % assignedRoute.stops.length;
    const stop = assignedRoute.stops[nextIdx];
    setCurrentStopIndex(nextIdx);
    await broadcastLocation(stop.latitude, stop.longitude, 38);
    setStatusMessage(`GPS Location broadcasted: Reached Stop #${nextIdx + 1} (${stop.stop_name})`);
  };

  // Auto-simulation effect
  useEffect(() => {
    let interval = null;
    if (tripActive && autoSimulating && assignedRoute?.stops?.length > 0) {
      interval = setInterval(() => {
        handleNextStop();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [tripActive, autoSimulating, currentStopIndex, assignedRoute]);

  const handleStartTrip = async () => {
    setTripActive(true);
    if (assignedBus) {
      await busService.updateStatus(assignedBus.id, 'Active');
      setAssignedBus(prev => ({ ...prev, status: 'Active' }));
    }
    setStatusMessage('Trip started! Live GPS telemetry is now broadcasting.');
  };

  const handleEndTrip = async () => {
    setTripActive(false);
    setAutoSimulating(false);
    setStatusMessage('Trip ended. Bus returned to depot.');
  };

  // Instant 1-Click Breakdown Trigger
  const handleReportBreakdown = async () => {
    if (!assignedBus) return;
    try {
      await incidentService.report({
        bus_id: assignedBus.id,
        route_id: assignedBus.route_id,
        description: 'Engine failure detected near North Gate junction, bus immobilized with heavy smoke.',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });
      setAssignedBus(prev => ({ ...prev, status: 'Breakdown' }));
      setStatusMessage('🚨 Breakdown incident reported! AI categorized as High Priority. Admin notified for replacement bus.');
    } catch (err) {
      console.error(err);
    }
  };

  // Instant 1-Click Delay Trigger
  const handleReportDelay = async () => {
    if (!assignedBus) return;
    try {
      await incidentService.report({
        bus_id: assignedBus.id,
        route_id: assignedBus.route_id,
        description: 'Heavy traffic congestion and roadblock causing 20 minutes schedule delay.',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });
      setAssignedBus(prev => ({ ...prev, status: 'Delayed' }));
      setStatusMessage('⏱️ Delay reported. Passengers notified.');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const stops = assignedRoute?.stops || [];
  const currentStop = stops[currentStopIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-amber-400" /> Trip Operations & GPS Broadcaster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real-time vehicle movement, broadcast GPS coordinates, and trigger incident alerts
          </p>
        </div>

        <StatusBadge status={assignedBus?.status} />
      </div>

      {statusMessage && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
          <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Cockpit Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Main Trip Action Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-400" /> Bus {assignedBus?.bus_number} Trip State
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
              tripActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {tripActive ? '● TRIP IN PROGRESS' : 'TRIP IDLE'}
            </span>
          </div>

          <div className="flex gap-3">
            {!tripActive ? (
              <button
                onClick={handleStartTrip}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Trip & GPS Stream
              </button>
            ) : (
              <button
                onClick={handleEndTrip}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 text-rose-400" /> End Trip
              </button>
            )}
          </div>

          {/* Stepper / Simulation buttons */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Live GPS Simulation:</span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSimulating}
                  disabled={!tripActive}
                  onChange={(e) => setAutoSimulating(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4"
                />
                <span>Auto-Step Stops (every 4s)</span>
              </label>
            </div>

            <button
              onClick={handleNextStop}
              disabled={!tripActive}
              className="w-full py-2.5 bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4 text-indigo-400" />
              Advance to Next Stop Waypoint ({currentStopIndex + 1}/{stops.length || 5})
            </button>
          </div>

          {/* 1-Click Quick Incident Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Emergency 1-Click Driver Alerts:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReportBreakdown}
                className="p-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold transition-colors flex flex-col items-center gap-1 shadow"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Report Breakdown
              </button>
              <button
                onClick={handleReportDelay}
                className="p-3 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-xl text-xs font-bold transition-colors flex flex-col items-center gap-1 shadow"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                Report Delay
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" /> Live Telemetry Output
          </h2>

          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">CURRENT WAYPOINT:</span>
              <span className="text-slate-100 font-bold">{currentStop?.stop_name || 'Amalapuram Clock Tower'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">LATITUDE:</span>
              <span className="text-indigo-400 font-bold">{currentLocation.latitude?.toFixed(5)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">LONGITUDE:</span>
              <span className="text-indigo-400 font-bold">{currentLocation.longitude?.toFixed(5)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">TELEMETRY SPEED:</span>
              <span className="text-emerald-400 font-bold">{currentLocation.speed} km/h</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">GPS STATUS:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE BROADCAST
              </span>
            </div>
          </div>

          {/* Route Stops Sequence */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">Route Waypoint Progress:</div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {stops.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                    idx === currentStopIndex
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold'
                      : idx < currentStopIndex
                      ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {s.stop_name}
                  </span>
                  {idx === currentStopIndex && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
