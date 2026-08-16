import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/api';
import { Route as RouteIcon, MapPin, Clock, Navigation, Bus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await routeService.getAll();
        const rList = res.data.routes || [];
        setRoutes(rList);
        if (rList.length > 0) setSelectedRoute(rList[0]);
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRoutes();
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
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <RouteIcon className="w-6 h-6 text-indigo-400" /> Transit Routes & Schedules
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore all city and college feeder routes, designated pickup points, and time estimates
        </p>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {routes.map((r) => {
          const isSelected = selectedRoute?.id === r.id;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRoute(r)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-600/10'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                  Route #{r.id}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {r.estimated_time || 30}m
                </span>
              </div>

              <h3 className="font-bold text-slate-100 text-sm mt-2.5 line-clamp-1">
                {r.route_name}
              </h3>

              <div className="mt-3 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate">Start: {r.start_point}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span className="truncate">End: {r.destination}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Detailed View */}
      {selectedRoute && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Detailed Route Breakdown
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {selectedRoute.route_name}
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                <span>Distance: <strong>{selectedRoute.distance_km || 15} km</strong></span>
                <span>Avg Travel Time: <strong>{selectedRoute.estimated_time || 35} mins</strong></span>
                <span>Stops: <strong>{selectedRoute.stops?.length || 0} pickup points</strong></span>
              </div>
            </div>

            <Link
              to={`/student/tracking`}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
            >
              <Navigation className="w-4 h-4" />
              Track on Live Map
            </Link>
          </div>

          {/* Stops List */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Designated Stop Sequence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedRoute.stops && selectedRoute.stops.map((stop, idx) => (
                <div
                  key={stop.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                    {stop.sequence || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-slate-200 truncate">
                      {stop.stop_name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Lat: {stop.latitude?.toFixed(4)}, Lng: {stop.longitude?.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
