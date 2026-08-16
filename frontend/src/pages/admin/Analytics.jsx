import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, Bus, Clock, ShieldCheck } from 'lucide-react';

export const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const fleet = stats?.fleet || {};
  const incidents = stats?.incidents || {};
  const categories = incidents.by_category || [];
  const priorities = incidents.by_priority || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-purple-400" /> Fleet Analytics & Performance Insights
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical trends, incident categorization distribution, and service reliability metrics
        </p>
      </div>

      {/* Grid: Charts and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Incidents by AI Category
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total: {incidents.total || 0}</span>
          </div>

          <div className="space-y-3 pt-2">
            {categories.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No category data recorded</div>
            ) : (
              categories.map((cat, idx) => {
                const pct = Math.min(100, Math.round((cat.count / (incidents.total || 1)) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{cat.category}</span>
                      <span className="text-slate-400 font-mono">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Priority Severity Breakdown
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {priorities.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No priority data recorded</div>
            ) : (
              priorities.map((prio, idx) => {
                const pct = Math.min(100, Math.round((prio.count / (incidents.total || 1)) * 100));
                const barColor = prio.priority === 'High' ? 'from-rose-500 to-rose-600' :
                                 prio.priority === 'Medium' ? 'from-amber-500 to-amber-600' :
                                 'from-emerald-500 to-emerald-600';
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{prio.priority} Priority</span>
                      <span className="text-slate-400 font-mono">{prio.count}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
