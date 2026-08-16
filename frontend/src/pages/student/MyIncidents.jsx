import React, { useState, useEffect } from 'react';
import { incidentService } from '../../services/api';
import { IncidentCard } from '../../components/IncidentCard';
import { History, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentMyIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentService.getAll();
      setIncidents(res.data.incidents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" /> Incident & Complaint History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time status of reported issues and administrative resolutions
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          title="Refresh Incidents"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Incidents Feed */}
      {incidents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No complaints reported yet</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            If you encounter delays, breakdowns or route changes, report them directly for instant AI analysis.
          </p>
          <Link
            to="/student/report-incident"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors mt-2"
          >
            Report an Issue Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isAdmin={false}
            />
          ))}
        </div>
      )}

    </div>
  );
};
