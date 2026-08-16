import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { busService, routeService, incidentService, mlService } from '../../services/api';
import { 
  AlertTriangle, 
  Sparkles, 
  Send, 
  Bus, 
  Route as RouteIcon, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { PriorityBadge } from '../../components/StatusBadge';

export const StudentReportIncident = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  
  const [formData, setFormData] = useState({
    bus_id: '',
    route_id: '',
    incident_type: '',
    description: '',
    priority: '',
    location: '',
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sample prompt chips for quick 1-click test input
  const quickPrompts = [
    { label: '🔥 Engine Breakdown', text: 'The engine of bus B12 started making loud knocking noise and stopped on the highway.' },
    { label: '⏱️ Traffic Delay', text: 'Bus B25 is delayed by 25 minutes due to heavy road construction near bridge.' },
    { label: '👥 Overcrowding', text: 'Bus is dangerously overcrowded, students are forced to travel on the footboard.' },
    { label: '🛑 Missed Stop', text: 'Driver did not stop at Clock Tower pickup point and skipped passengers.' },
    { label: '⚠️ Driver Overspeeding', text: 'Driver is overspeeding and talking on the mobile phone while driving.' },
  ];

  useEffect(() => {
    const loadResources = async () => {
      try {
        const [busesRes, routesRes] = await Promise.all([
          busService.getAll(),
          routeService.getAll()
        ]);
        setBuses(busesRes.data.buses || []);
        setRoutes(routesRes.data.routes || []);
        if (busesRes.data.buses?.length > 0) {
          setFormData(prev => ({
            ...prev,
            bus_id: busesRes.data.buses[0].id,
            route_id: busesRes.data.buses[0].route_id || ''
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadResources();
  }, []);

  // Live ML classification on description typing (debounced)
  useEffect(() => {
    if (!formData.description || formData.description.trim().length < 5) {
      setAiAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await mlService.classifyComplaint(formData.description);
        setAiAnalysis(res.data);
        if (!formData.incident_type) {
          setFormData(prev => ({
            ...prev,
            incident_type: res.data.category,
            priority: res.data.priority
          }));
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      } finally {
        setIsAnalyzing(false);
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
        route_id: formData.route_id ? parseInt(formData.route_id) : null,
        incident_type: formData.incident_type || aiAnalysis?.category || 'Other',
        priority: formData.priority || aiAnalysis?.priority || 'Medium',
        description: formData.description,
        latitude: 16.5850,
        longitude: 82.0250
      });

      setSuccessMsg('Complaint registered and triaged by AI system successfully!');
      setTimeout(() => {
        navigate('/student/my-incidents');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-amber-400" /> Report Issue or Transit Complaint
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit complaints for real-time AI triage, admin intervention, and replacement bus dispatch
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        
        {/* Quick prompt suggestions */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Quick Test Prompts (1-Click Fill)
          </label>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, description: p.text }))}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bus & Route Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-indigo-400" /> Target Bus
            </label>
            <select
              value={formData.bus_id}
              onChange={(e) => {
                const bId = e.target.value;
                const busObj = buses.find(b => b.id === parseInt(bId));
                setFormData(prev => ({
                  ...prev,
                  bus_id: bId,
                  route_id: busObj?.route_id || prev.route_id
                }));
              }}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Select Bus --</option>
              {buses.map(b => (
                <option key={b.id} value={b.id}>
                  Bus {b.bus_number} ({b.route_name || 'Standby'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <RouteIcon className="w-3.5 h-3.5 text-cyan-400" /> Transit Route
            </label>
            <select
              value={formData.route_id}
              onChange={(e) => setFormData(prev => ({ ...prev, route_id: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Select Route --</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.route_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Complaint Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Describe the Issue in Plain English
          </label>
          <textarea
            rows="4"
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="e.g. Bus engine stopped with smoke coming out near bypass junction..."
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
          ></textarea>
        </div>

        {/* Real-time AI Triage Preview */}
        {(aiAnalysis || isAnalyzing) && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                Live AI Classification Preview (Scikit-Learn TF-IDF Engine)
              </span>
              {isAnalyzing && <span className="text-[10px] text-slate-400 font-mono">Analyzing text...</span>}
            </div>

            {aiAnalysis && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Predicted Category</div>
                  <div className="font-bold text-slate-100 mt-0.5">{aiAnalysis.category}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Predicted Priority</div>
                  <div className="font-bold text-rose-400 mt-0.5 flex items-center gap-1.5">
                    <PriorityBadge priority={aiAnalysis.priority} />
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Model Confidence</div>
                  <div className="font-bold text-emerald-400 mt-0.5 font-mono">
                    {Math.round((aiAnalysis.confidence || 0.85) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || !formData.description.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting & Triaging...' : 'Submit Complaint to Transport Admin'}
        </button>

      </form>

    </div>
  );
};
