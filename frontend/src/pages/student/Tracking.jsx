import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { busService, routeService, trackingService } from '../../services/api';
import { LeafletMap } from '../../components/LeafletMap';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Bus, 
  MapPin, 
  Clock, 
  RotateCw, 
  Navigation, 
  Layers, 
  AlertTriangle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const StudentTracking = () => {
  const [searchParams] = useSearchParams();
  const initialBusId = searchParams.get('bus_id');

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(initialBusId ? parseInt(initialBusId) : null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const [busesRes, routesRes] = await Promise.all([
        busService.getAll(),
        routeService.getAll()
      ]);
      const fetchedBuses = busesRes.data.buses || [];
      const fetchedRoutes = routesRes.data.routes || [];

      setBuses(fetchedBuses);
      setRoutes(fetchedRoutes);

      // Default select the first active bus or specified bus
      if (!selectedBusId && fetchedBuses.length > 0) {
        setSelectedBusId(fetchedBuses[0].id);
        setSelectedRouteId(fetchedBuses[0].route_id);
      }
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 5000); // 5s live GPS sync
    return () => clearInterval(interval);
  }, []);

  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];
  const activeRoute = routes.find(r => r.id === (selectedBus?.route_id || selectedRouteId));

  const handleSelectBus = (bus) => {
    setSelectedBusId(bus.id);
    setSelectedRouteId(bus.route_id);
  };

  if (loading && buses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Navigation className="w-6 h-6 text-indigo-400" /> Real-Time Live Bus Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive OpenStreetMap tracking with simulated real-time GPS telemetry
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Route selector */}
          <select
            value={selectedBus?.id || ''}
            onChange={(e) => {
              const b = buses.find(x => x.id === parseInt(e.target.value));
              if (b) handleSelectBus(b);
            }}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {buses.map(b => (
              <option key={b.id} value={b.id}>
                Bus {b.bus_number} — {b.route_name || 'Standby'} ({b.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => loadData(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Live Positions"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Replacement Bus Banner Alert */}
      {selectedBus && selectedBus.status === 'Replacement' && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-700/60 flex items-center gap-3 text-xs sm:text-sm text-cyan-200">
          <Bus className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="font-bold">Active Replacement Vehicle:</span> Bus {selectedBus.bus_number} has been dispatched as a replacement bus on {activeRoute?.route_name || 'this route'}.
          </div>
        </div>
      )}

      {/* Main Map + Side Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Map */}
        <div className="lg:col-span-2 h-[550px]">
          <LeafletMap
            buses={buses}
            selectedBus={selectedBus}
            route={activeRoute}
            stops={activeRoute?.stops || []}
            onSelectBus={handleSelectBus}
          />
        </div>

        {/* Right 1 Col: Selected Bus & Stop Sequencer */}
        <div className="space-y-4">
          
          {/* Active Bus Card */}
          {selectedBus && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono">SELECTED VEHICLE</div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                    Bus {selectedBus.bus_number}
                    <StatusBadge status={selectedBus.status} size="sm" />
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Reg No</div>
                  <div className="font-mono text-xs text-slate-300 font-semibold">{selectedBus.registration_number || 'AP-39-T-1212'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">DRIVER</span>
                  <span className="text-slate-200 font-semibold">{selectedBus.driver_name || 'On Duty'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CAPACITY</span>
                  <span className="text-slate-200 font-semibold">{selectedBus.capacity} Seats</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500 block text-[10px]">CURRENT SPEED</span>
                  <span className="text-emerald-400 font-semibold">{selectedBus.latest_location?.speed || 35} km/h</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500 block text-[10px]">ESTIMATED ARRIVAL</span>
                  <span className="text-indigo-400 font-semibold">{activeRoute?.estimated_time || 25} mins</span>
                </div>
              </div>
            </div>
          )}

          {/* Stop Sequence Progress */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" /> Route Stops Sequence
            </h3>

            {activeRoute?.stops && activeRoute.stops.length > 0 ? (
              <div className="space-y-3 mt-3 relative pl-3 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {activeRoute.stops.map((stop, idx) => (
                  <div key={stop.id || idx} className="flex items-start gap-3 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-indigo-500 text-[10px] font-bold text-indigo-300 flex items-center justify-center shrink-0">
                      {stop.sequence || idx + 1}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-slate-200">{stop.stop_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {idx === 0 ? 'Starting Point' : idx === activeRoute.stops.length - 1 ? 'Campus Destination' : `ETA ~+${idx * 7}m`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-4 text-center">
                No stops configured for this route
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
