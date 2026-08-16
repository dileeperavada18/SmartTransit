import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/api';
import { Route as RouteIcon, Plus, Edit2, Trash2, MapPin, Clock, CheckCircle2, X } from 'lucide-react';

export const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const [formData, setFormData] = useState({
    route_name: '',
    start_point: '',
    destination: '',
    estimated_time: 30,
    distance_km: 15.0,
    stops: [
      { stop_name: '', latitude: 16.5780, longitude: 82.0050, sequence: 1 },
      { stop_name: '', latitude: 16.6020, longitude: 82.0500, sequence: 2 }
    ]
  });

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const res = await routeService.getAll();
      setRoutes(res.data.routes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFormData({
      route_name: '',
      start_point: '',
      destination: '',
      estimated_time: 35,
      distance_km: 15.0,
      stops: [
        { stop_name: 'Start Terminal', latitude: 16.5780, longitude: 82.0050, sequence: 1 },
        { stop_name: 'Campus Main Gate', latitude: 16.6020, longitude: 82.0500, sequence: 2 }
      ]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setEditingRoute(r);
    setFormData({
      route_name: r.route_name,
      start_point: r.start_point,
      destination: r.destination,
      estimated_time: r.estimated_time || 30,
      distance_km: r.distance_km || 15.0,
      stops: r.stops?.length > 0 ? r.stops : [
        { stop_name: r.start_point, latitude: 16.5780, longitude: 82.0050, sequence: 1 },
        { stop_name: r.destination, latitude: 16.6020, longitude: 82.0500, sequence: 2 }
      ]
    });
    setShowModal(true);
  };

  const handleAddStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        { stop_name: `Stop ${prev.stops.length + 1}`, latitude: 16.5850, longitude: 82.0250, sequence: prev.stops.length + 1 }
      ]
    }));
  };

  const handleRemoveStop = (index) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, idx) => idx !== index)
    }));
  };

  const handleStopChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.stops];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stops: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        route_name: formData.route_name,
        start_point: formData.start_point,
        destination: formData.destination,
        estimated_time: parseInt(formData.estimated_time) || 30,
        distance_km: parseFloat(formData.distance_km) || 15.0,
        stops: formData.stops
      };

      if (editingRoute) {
        await routeService.update(editingRoute.id, payload);
        setStatusMsg(`Route ${payload.route_name} updated successfully`);
      } else {
        await routeService.create(payload);
        setStatusMsg(`Route ${payload.route_name} created successfully`);
      }

      setShowModal(false);
      loadRoutes();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save route');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await routeService.delete(id);
      setRoutes(prev => prev.filter(r => r.id !== id));
      setStatusMsg(`Route deleted`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <RouteIcon className="w-6 h-6 text-indigo-400" /> Route & Stop Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure transit routes, GPS stop coordinates, sequence orders, and average trip times
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Route
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routes.map((route) => (
          <div
            key={route.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Route #{route.id}
                </span>
                <h2 className="text-base font-bold text-slate-100 mt-1">
                  {route.route_name}
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                  {route.start_point} → {route.destination}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(route)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  title="Edit Route"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(route.id, route.route_name)}
                  className="p-2 bg-slate-800 hover:bg-rose-600/30 hover:text-rose-300 text-slate-300 rounded-xl transition-colors"
                  title="Delete Route"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">DISTANCE</span>
                <span className="text-slate-200">{route.distance_km || 15} km</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ESTIMATED TIME</span>
                <span className="text-slate-200">{route.estimated_time || 30} mins</span>
              </div>
            </div>

            {/* Stops list */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Stops & Waypoints ({route.stops?.length || 0}):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {route.stops && route.stops.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold text-cyan-300 flex items-center justify-center">
                        {s.sequence || idx + 1}
                      </span>
                      {s.stop_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-indigo-400" />
                {editingRoute ? `Edit Route #${editingRoute.id}` : 'Create New Route'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route 5 — South Town → College Campus"
                  value={formData.route_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, route_name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Point</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Town Center"
                    value={formData.start_point}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_point: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. College Campus"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Time (mins)</label>
                  <input
                    type="number"
                    value={formData.estimated_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance_km: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stops management */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Route Stops & Sequence</span>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
                  >
                    + Add Stop
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Stop name"
                        value={stop.stop_name}
                        onChange={(e) => handleStopChange(idx, 'stop_name', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Lat"
                        value={stop.latitude}
                        onChange={(e) => handleStopChange(idx, 'latitude', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Lng"
                        value={stop.longitude}
                        onChange={(e) => handleStopChange(idx, 'longitude', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="p-1 text-rose-400 hover:bg-rose-950/40 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
