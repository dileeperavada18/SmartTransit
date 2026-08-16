import React, { useState, useEffect } from 'react';
import { incidentService, busService, authService } from '../../services/api';
import { IncidentCard } from '../../components/IncidentCard';
import { 
  AlertTriangle, 
  Filter, 
  Bus, 
  UserCheck, 
  CheckCircle2, 
  X, 
  Layers, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusMsg, setStatusMsg] = useState('');

  // Modals state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [activeIncident, setActiveIncident] = useState(null);

  // Staff assign state
  const [selectedStaffId, setSelectedStaffId] = useState('3'); // Driver 2 / Suresh
  const [staffNotes, setStaffNotes] = useState('');

  // Replacement bus assign state
  const [selectedReplacementBusId, setSelectedReplacementBusId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [incRes, busesRes] = await Promise.all([
        incidentService.getAll(),
        busService.getAll()
      ]);
      setIncidents(incRes.data.incidents || []);
      setBuses(busesRes.data.buses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssignStaff = (incident) => {
    setActiveIncident(incident);
    setSelectedStaffId('3');
    setStaffNotes(`Assigned response for Incident #${incident.id}`);
    setStaffModalOpen(true);
  };

  const handleOpenAssignReplacement = (incident) => {
    setActiveIncident(incident);
    // Suggest an active or standby bus (not the broken bus itself)
    const availableBus = buses.find(b => b.id !== incident.bus_id && b.status !== 'Breakdown');
    setSelectedReplacementBusId(availableBus ? availableBus.id : '');
    setReplaceModalOpen(true);
  };

  const handleConfirmStaffAssign = async (e) => {
    e.preventDefault();
    if (!activeIncident || !selectedStaffId) return;

    try {
      await incidentService.assignStaff(activeIncident.id, parseInt(selectedStaffId), staffNotes);
      setStaffModalOpen(false);
      setStatusMsg(`Transport staff assigned to Incident #${activeIncident.id}`);
      loadData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReplacement = async (e) => {
    e.preventDefault();
    if (!activeIncident || !selectedReplacementBusId) return;

    try {
      const res = await incidentService.assignReplacement(activeIncident.id, parseInt(selectedReplacementBusId));
      setReplaceModalOpen(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setStatusMsg(res.data.message || 'Replacement bus successfully dispatched');
      loadData();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (incidentId) => {
    try {
      await incidentService.updateStatus(incidentId, 'Resolved');
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      setStatusMsg(`Incident #${incidentId} marked as Resolved`);
      loadData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && inc.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" /> Incident Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time AI triage triage, rapid staff dispatch, and replacement bus routing
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Incidents"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Filter className="w-4 h-4 text-indigo-400" /> Filter:
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status:</span>
          {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Priority:</span>
          {['All', 'High', 'Medium', 'Low'].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                priorityFilter === pr
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No incidents matching filter</div>
            <p className="text-xs text-slate-500">All filtered parameters are clear.</p>
          </div>
        ) : (
          filtered.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isAdmin={true}
              onAssignStaff={handleOpenAssignStaff}
              onAssignReplacement={handleOpenAssignReplacement}
              onResolve={handleResolve}
            />
          ))
        )}
      </div>

      {/* Assign Staff Modal */}
      {staffModalOpen && activeIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                Assign Staff to Incident #{activeIncident.id}
              </h2>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStaffAssign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Transport Staff / Mechanic</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="2">Ramesh Kumar (Driver / Mechanic)</option>
                  <option value="3">Suresh Reddy (Standby Fleet Operator)</option>
                  <option value="4">Venkat Rao (Field Transport Officer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dispatch Instructions & Notes</label>
                <textarea
                  rows="3"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 transition-all"
                >
                  Confirm Staff Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Replacement Bus Modal */}
      {replaceModalOpen && activeIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bus className="w-5 h-5 text-cyan-400" />
                Dispatch Replacement Bus
              </h2>
              <button
                onClick={() => setReplaceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200">
              Dispatched bus will automatically take over <strong>{activeIncident.route_name || 'the route'}</strong> and notify all affected passengers.
            </div>

            <form onSubmit={handleConfirmReplacement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Standby Replacement Bus</label>
                <select
                  value={selectedReplacementBusId}
                  onChange={(e) => setSelectedReplacementBusId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.id === activeIncident.bus_id}>
                      Bus {b.bus_number} ({b.route_name || 'Standby'}) — Status: {b.status} {b.id === activeIncident.bus_id ? '(Broken)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplaceModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  Dispatch Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
