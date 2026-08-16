import React, { useState, useEffect } from 'react';
import { busService, routeService } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Bus, 
  Plus, 
  Edit2, 
  Trash2, 
  Route as RouteIcon, 
  User, 
  CheckCircle2, 
  X,
  RefreshCw,
  Search
} from 'lucide-react';

export const AdminBuses = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    registration_number: '',
    capacity: 50,
    status: 'Active',
    route_id: '',
    driver_id: ''
  });
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [busesRes, routesRes] = await Promise.all([
        busService.getAll(),
        routeService.getAll()
      ]);
      setBuses(busesRes.data.buses || []);
      setRoutes(routesRes.data.routes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBus(null);
    setFormData({
      bus_number: '',
      registration_number: '',
      capacity: 50,
      status: 'Active',
      route_id: '',
      driver_id: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      registration_number: bus.registration_number || '',
      capacity: bus.capacity || 50,
      status: bus.status,
      route_id: bus.route_id || '',
      driver_id: bus.driver_id || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bus_number: formData.bus_number,
        registration_number: formData.registration_number,
        capacity: parseInt(formData.capacity) || 50,
        status: formData.status,
        route_id: formData.route_id ? parseInt(formData.route_id) : null,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null
      };

      if (editingBus) {
        await busService.update(editingBus.id, payload);
        setStatusMsg(`Bus ${payload.bus_number} updated successfully`);
      } else {
        await busService.create(payload);
        setStatusMsg(`Bus ${payload.bus_number} added to fleet successfully`);
      }

      setShowModal(false);
      loadData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save bus');
    }
  };

  const handleDelete = async (id, busNum) => {
    if (!window.confirm(`Are you sure you want to remove Bus ${busNum} from the fleet?`)) return;
    try {
      await busService.delete(id);
      setBuses(prev => prev.filter(b => b.id !== id));
      setStatusMsg(`Bus ${busNum} removed from fleet`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBuses = buses.filter(b => 
    b.bus_number.toLowerCase().includes(search.toLowerCase()) ||
    (b.route_name && b.route_name.toLowerCase().includes(search.toLowerCase())) ||
    (b.driver_name && b.driver_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bus className="w-6 h-6 text-indigo-400" /> Fleet Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain campus buses, status states, driver assignments, and capacity limits
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Bus
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search by bus number, assigned route, or driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Fleet Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Bus Identifier</th>
                <th className="px-4 py-3.5">Registration</th>
                <th className="px-4 py-3.5">Capacity</th>
                <th className="px-4 py-3.5">Assigned Route</th>
                <th className="px-4 py-3.5">Driver On Duty</th>
                <th className="px-4 py-3.5">Live Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredBuses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-100 font-mono text-sm">
                    Bus {bus.bus_number}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono">
                    {bus.registration_number || 'N/A'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {bus.capacity || 50} seats
                  </td>
                  <td className="px-4 py-3.5 text-slate-200">
                    {bus.route_name || <span className="text-slate-500 italic">Standby Fleet</span>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-200">
                    {bus.driver_name || <span className="text-slate-500 italic">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={bus.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(bus)}
                      className="p-1.5 bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 rounded-lg transition-colors inline-block"
                      title="Edit Bus"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bus.id, bus.bus_number)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-600/30 hover:text-rose-300 text-slate-300 rounded-lg transition-colors inline-block"
                      title="Delete Bus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bus className="w-5 h-5 text-indigo-400" />
                {editingBus ? `Edit Bus ${editingBus.bus_number}` : 'Add New Fleet Bus'}
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
                <label className="block text-slate-300 font-semibold mb-1">Bus Number / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B35"
                  value={formData.bus_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, bus_number: e.target.value.toUpperCase() }))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. AP-39-T-3535"
                  value={formData.registration_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Replacement">Replacement</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Route</label>
                <select
                  value={formData.route_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, route_id: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Standby / No Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.route_name}</option>
                  ))}
                </select>
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
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
