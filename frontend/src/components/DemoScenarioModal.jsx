import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bus, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  RotateCcw,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { incidentService, busService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DemoScenarioModal = ({ isOpen, onClose, onRefreshData }) => {
  const { quickLoginAs } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [demoState, setDemoState] = useState({
    b12: null,
    b18: null,
    incident: null,
    aiAnalysis: null,
    replacement: null,
  });

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Step 1: Initialize B12 on Route 4
  const handleStep1 = async () => {
    setLoading(true);
    try {
      await quickLoginAs('driver');
      const busesRes = await busService.getAll();
      const b12 = busesRes.data.buses.find(b => b.bus_number === 'B12');
      const b18 = busesRes.data.buses.find(b => b.bus_number === 'B18');
      
      // Ensure B12 is active
      if (b12) await busService.updateStatus(b12.id, 'Active');
      
      setDemoState(prev => ({ ...prev, b12, b18 }));
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Driver reports breakdown with AI triage
  const handleStep2 = async () => {
    setLoading(true);
    try {
      const res = await incidentService.report({
        bus_id: demoState.b12?.id,
        description: 'Engine failure detected near North Gate junction, bus stopped with heavy white smoke.',
        latitude: 16.5950,
        longitude: 82.0430
      });
      setDemoState(prev => ({
        ...prev,
        incident: res.data.incident,
        aiAnalysis: res.data.ai_analysis
      }));
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Admin reviews AI triage and assigns staff & replacement bus B18
  const handleStep3 = async () => {
    setLoading(true);
    try {
      await quickLoginAs('admin');
      
      // 1. Assign Staff (Driver 2 / Suresh)
      await incidentService.assignStaff(demoState.incident?.id, 3, 'Urgent breakdown recovery dispatched');
      
      // 2. Assign Replacement Bus B18
      const repRes = await incidentService.assignReplacement(demoState.incident?.id, demoState.b18?.id);
      
      setDemoState(prev => ({
        ...prev,
        replacement: repRes.data.replacement
      }));
      setCurrentStep(4);
      triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Student receives notification & tracks replacement bus
  const handleStep4 = async () => {
    setLoading(true);
    try {
      await quickLoginAs('student');
      setCurrentStep(5);
      triggerConfetti();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setDemoState({
      b12: null,
      b18: null,
      incident: null,
      aiAnalysis: null,
      replacement: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Live MVP Demo Scenario: Bus Breakdown & Replacement
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end integration walkthrough across Driver, AI triage, Admin, and Student
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
            <div className={`p-2 rounded-xl border ${currentStep >= 1 ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              1. Bus Active
            </div>
            <div className={`p-2 rounded-xl border ${currentStep >= 2 ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              2. Driver Issue + AI
            </div>
            <div className={`p-2 rounded-xl border ${currentStep >= 3 ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              3. Admin Dispatch
            </div>
            <div className={`p-2 rounded-xl border ${currentStep >= 4 ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              4. Student Alert
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-emerald-400" />
                  Initial State: Bus B12 on Route 4
                </div>
                <p>
                  Bus <strong>B12</strong> is actively operating on <strong>Route 4 (Town Center → College Campus)</strong> with students on board. Standby bus <strong>B18</strong> is ready at the depot.
                </p>
              </div>
              <button
                onClick={handleStep1}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Initializing...' : 'Step 1: Start Scenario with Bus B12'}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-sm text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Driver Reports Mechanical Breakdown
                </div>
                <p className="italic text-slate-200">
                  «Engine failure detected near North Gate junction, bus stopped with heavy white smoke.»
                </p>
                <p className="text-[11px] text-slate-400">
                  The complaint will automatically trigger the scikit-learn TF-IDF + Logistic Regression model to determine Category & Priority in real-time.
                </p>
              </div>
              <button
                onClick={handleStep2}
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                {loading ? 'Simulating ML Analysis...' : 'Step 2: Submit Driver Report & Run AI Triage'}
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {demoState.aiAnalysis && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-sm text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Triage Results
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Predicted Category</div>
                      <div className="font-bold text-rose-400 text-xs">{demoState.aiAnalysis.category}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Priority Level</div>
                      <div className="font-bold text-rose-400 text-xs">{demoState.aiAnalysis.priority}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Confidence</div>
                      <div className="font-bold text-emerald-400 text-xs">{Math.round(demoState.aiAnalysis.confidence * 100)}%</div>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Dispatching Replacement...' : 'Step 3: Admin Assigns Replacement Bus B18'}
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  Fleet Reconfiguration & Broadcast
                </div>
                <div className="text-xs space-y-1">
                  <p>✓ Bus <strong>B12</strong> marked as <span className="text-rose-400 font-bold">Breakdown</span>.</p>
                  <p>✓ Standby Bus <strong>B18</strong> reassigned to Route 4 as <span className="text-cyan-400 font-bold">Replacement</span>.</p>
                  <p>✓ Broadcast notification sent to all Route 4 students.</p>
                </div>
              </div>
              <button
                onClick={handleStep4}
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Switching Persona...' : 'Step 4: View Student Alert & Live Tracking'}
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-slate-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="font-bold text-base text-emerald-300">
                  End-to-End Demonstration Complete!
                </div>
                <p className="text-slate-300 max-w-md mx-auto">
                  You are now logged in as Student. Open the <strong>Live Bus Tracking</strong> tab to see replacement bus <strong>B18</strong> live on Route 4!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Demo
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Close & Explore App
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
