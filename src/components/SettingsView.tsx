import React, { useState } from "react";
import {
  Settings,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Save,
  HelpCircle
} from "lucide-react";

interface SettingsViewProps {
  weights: {
    medical_priority: number;
    urgency: number;
    deadline_urgency: number;
    waiting_time: number;
  };
  onSaveWeights: (newWeights: any, intervalMinutes: number) => void;
  intervalMinutes: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  weights,
  onSaveWeights,
  intervalMinutes: currentInterval
}) => {
  const [medicalPct, setMedicalPct] = useState(Math.round(weights.medical_priority * 100));
  const [urgencyPct, setUrgencyPct] = useState(Math.round(weights.urgency * 100));
  const [deadlinePct, setDeadlinePct] = useState(Math.round(weights.deadline_urgency * 100));
  const [waitingPct, setWaitingPct] = useState(Math.round(weights.waiting_time * 100));
  const [interval, setInterval] = useState<number>(currentInterval || 30);
  const [isSaved, setIsSaved] = useState(false);

  const total = medicalPct + urgencyPct + deadlinePct + waitingPct;

  const handleResetDefaults = () => {
    setMedicalPct(40);
    setUrgencyPct(25);
    setDeadlinePct(25);
    setWaitingPct(10);
    setInterval(30);
  };

  const handleSave = () => {
    const normalized = {
      medical_priority: medicalPct / 100,
      urgency: urgencyPct / 100,
      deadline_urgency: deadlinePct / 100,
      waiting_time: waitingPct / 100
    };
    onSaveWeights(normalized, interval);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Algorithm Tuning & Discretization</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Algorithm Weights & Grid Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize the linear coefficients for the Priority Queue composite score and select discrete Job Sequencing intervals.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Priority Queue Weights Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">
              1. Priority Queue Multi-Criteria Weights
            </h3>
          </div>
          <div className="text-xs font-mono font-bold">
            Total: <span className={total === 100 ? "text-emerald-400" : "text-amber-400"}>{total}%</span>
          </div>
        </div>

        {total !== 100 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
            Tip: Weights currently sum to {total}%. The Python algorithm automatically normalizes weights to sum to 100% during execution.
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Medical Priority */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">
                Medical Priority (Emergency to Low: 5 &rarr; 1)
              </span>
              <span className="font-mono font-bold text-cyan-300">{medicalPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={medicalPct}
              onChange={(e) => setMedicalPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Urgency */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">
                Urgency Level (Immediate to Normal: 5 &rarr; 1)
              </span>
              <span className="font-mono font-bold text-cyan-300">{urgencyPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={urgencyPct}
              onChange={(e) => setUrgencyPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Deadline Urgency */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">
                Deadline Urgency (Early deadline tighter slack: 5 &rarr; 1)
              </span>
              <span className="font-mono font-bold text-cyan-300">{deadlinePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={deadlinePct}
              onChange={(e) => setDeadlinePct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Waiting Factor */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">
                Waiting Factor (Pre-existing delay: 4 &rarr; 1)
              </span>
              <span className="font-mono font-bold text-cyan-300">{waitingPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={waitingPct}
              onChange={(e) => setWaitingPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Job Sequencing Grid Increment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <Clock className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-slate-200">
            2. Job Sequencing Discrete Scheduling Increment
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Surgeries are treated as contiguous multi-unit jobs. The scheduling increment defines the discrete time unit interval when searching for candidate slots.
        </p>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div
            onClick={() => setInterval(30)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              interval === 30
                ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-md"
                : "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <div className="font-bold text-sm">30-Minute Grid (Default)</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Balanced operating unit (e.g. 08:00, 08:30, 09:00). Minimizes fragmentation.
            </div>
          </div>

          <div
            onClick={() => setInterval(15)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              interval === 15
                ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-md"
                : "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <div className="font-bold text-sm">15-Minute Grid (High Granularity)</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Finer temporal grain (e.g. 08:00, 08:15, 08:30). High-density scheduling.
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3">
        {isSaved && (
          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuration saved successfully!</span>
          </span>
        )}
        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Apply Algorithm Configuration</span>
        </button>
      </div>
    </div>
  );
};
