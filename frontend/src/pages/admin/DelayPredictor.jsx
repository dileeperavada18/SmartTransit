import React, { useState } from 'react';
import { mlService } from '../../services/api';
import { Cpu, Sparkles, Clock, CloudRain, Navigation, MapPin, Gauge, CheckCircle2 } from 'lucide-react';

export const AdminDelayPredictor = () => {
  const [inputs, setInputs] = useState({
    distance_km: 18.5,
    stops_count: 5,
    hour_of_day: 9,
    day_of_week: 1, // Monday
    traffic_level: 2, // 1=Low, 2=Medium, 3=Heavy, 4=Severe
    previous_delay: 0,
    is_rainy: 0
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await mlService.predictDelay(inputs);
      setPrediction(res.data);
    } catch (err) {
      console.error('Failed to predict delay:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-purple-400" /> AI Transit Delay Prediction Sandbox
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Machine Learning regression engine (Random Forest) predicting estimated route delays from real-time environmental factors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Simulation Form */}
        <form onSubmit={handlePredict} className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400" />
            Route & Traffic Simulation Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Route Distance (km)</label>
              <input
                type="number"
                step="0.5"
                value={inputs.distance_km}
                onChange={(e) => setInputs(prev => ({ ...prev, distance_km: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Number of Stops / Waypoints</label>
              <input
                type="number"
                value={inputs.stops_count}
                onChange={(e) => setInputs(prev => ({ ...prev, stops_count: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hour of Day (24-Hour Format)</label>
              <select
                value={inputs.hour_of_day}
                onChange={(e) => setInputs(prev => ({ ...prev, hour_of_day: parseInt(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => (
                  <option key={h} value={h}>
                    {h}:00 {h >= 8 && h <= 10 ? '(Morning Rush Peak)' : h >= 16 && h <= 19 ? '(Evening Peak)' : '(Regular Hours)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Traffic Congestion Level</label>
              <select
                value={inputs.traffic_level}
                onChange={(e) => setInputs(prev => ({ ...prev, traffic_level: parseInt(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="1">Level 1 — Light Free-Flow Traffic</option>
                <option value="2">Level 2 — Moderate City Traffic</option>
                <option value="3">Level 3 — Heavy Stop-and-Go Traffic</option>
                <option value="4">Level 4 — Severe Gridlock / Road Blockage</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Carried Previous Delay (Minutes)</label>
              <input
                type="number"
                value={inputs.previous_delay}
                onChange={(e) => setInputs(prev => ({ ...prev, previous_delay: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weather Conditions</label>
              <select
                value={inputs.is_rainy}
                onChange={(e) => setInputs(prev => ({ ...prev, is_rainy: parseInt(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="0">Clear / Normal Weather</option>
                <option value="1">Heavy Monsoon Rain / Waterlogged Roads</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Running Random Forest Model...' : 'Calculate Predicted Route Delay'}
          </button>
        </form>

        {/* Right 1 Col: AI Prediction Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 font-mono">
              AIML INFERENCE RESULT
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-1">
              Estimated Delay Output
            </h2>

            {prediction ? (
              <div className="mt-6 space-y-4 text-center">
                <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-4xl font-black text-purple-300 font-mono">
                    +{prediction.predicted_delay_minutes} <span className="text-lg">mins</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Expected Arrival Delay
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ML Model:</span>
                    <span className="text-slate-200 font-mono font-bold">Random Forest Regressor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inference Confidence:</span>
                    <span className="text-emerald-400 font-mono font-bold">{Math.round((prediction.confidence || 0.9)*100)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Click "Calculate Predicted Route Delay" to run the scikit-learn regressor model.</p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
            Features evaluated: Distance, Stops, Rush Hour penalty, Congestion level, Previous delay carry-over, Weather factor.
          </div>
        </div>

      </div>

    </div>
  );
};
