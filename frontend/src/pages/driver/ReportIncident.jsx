import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { busService, incidentService, mlService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Sparkles, Send, Bus, CheckCircle2 } from 'lucide-react';
import { PriorityBadge } from '../../components/StatusBadge';

export const DriverReportIncident = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({
    bus_id: '',
    incident_type: '',
    description: '',
    priority: '',
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadBuses = async () => {
      try {
        const res = await busService.getAll();
        setBuses(res.data.buses || []);
        const myBus = res.data.buses.find(b => b.driver_id === user?.id) || res.data.buses[0];
        if (myBus) {
          setFormData(prev => ({ ...prev, bus_id: myBus.id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadBuses();
  }, [user]);

  useEffect(() => {
    if (!formData.description || formData.description.trim().length < 5) {
      setAiAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await mlService.classifyComplaint(formData.description);
        setAiAnalysis(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    setSubmitting(true);
    try {
      await incidentService.report({
        bus_id: formData.bus_id ? parseInt(formData.bus_id) : null,
        incident_type: formData.incident_type || aiAnalysis?.category || 'Breakdown',
        priority: formData.priority || aiAnalysis?.priority || 'High',
        description: formData.description,
        latitude: 16.5850,
        longitude: 82.0250
      });

      setSuccessMsg('Driver report logged! Admin notified and bus status updated.');
      setTimeout(() => {
        navigate('/driver/trip-control');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-rose-400" /> Driver Emergency & Incident Report
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Directly alert the transport admin of mechanical failures, tire punctures, or route blockages
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Bus className="w-3.5 h-3.5 text-amber-400" /> Current Vehicle
          </label>
          <select
            value={formData.bus_id}
            onChange={(e) => setFormData(prev => ({ ...prev, bus_id: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {buses.map(b => (
              <option key={b.id} value={b.id}>
                Bus {b.bus_number} — {b.route_name || 'No Route'} ({b.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Technical Problem or Incident Description
          </label>
          <textarea
            rows="4"
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="e.g. Engine temperature gauge in red zone, white smoke leaking from radiator..."
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
          ></textarea>
        </div>

        {aiAnalysis && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Triage Assessment
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Classified Type</span>
                <span className="font-bold text-slate-100">{aiAnalysis.category}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Assigned Priority</span>
                <span className="font-bold text-rose-400">{aiAnalysis.priority}</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !formData.description.trim()}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting Report...' : 'Broadcast Emergency Report to Admin'}
        </button>
      </form>
    </div>
  );
};
