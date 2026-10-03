import React, { useState } from "react";
import {
  Cpu,
  Layers,
  Hospital,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Filter,
  HelpCircle,
  Activity
} from "lucide-react";
import { AlgorithmStep, DecisionLog, Surgery } from "../types";

interface DecisionCenterViewProps {
  algorithmSteps: AlgorithmStep[];
  decisionLogs: DecisionLog[];
  surgeries: Surgery[];
  onSelectSurgery: (s: any) => void;
}

export const DecisionCenterView: React.FC<DecisionCenterViewProps> = ({
  algorithmSteps,
  decisionLogs,
  surgeries,
  onSelectSurgery
}) => {
  // Find queue step
  const queueStep = algorithmSteps.find((s) => s.step_number === 1);
  const queueItems: any[] = queueStep?.data || [];

  // Filter surgery evaluation steps
  const surgerySteps = algorithmSteps.filter((s) => s.step_number > 1 && s.surgery_id);

  // Selected surgery step to explore
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string>(
    surgerySteps.length > 0 ? surgerySteps[0].surgery_id! : ""
  );

  const activeStep = surgerySteps.find((s) => s.surgery_id === selectedSurgeryId) || surgerySteps[0];
  const activeSurgery = surgeries.find((s) => s.id === selectedSurgeryId);
  const activeLog = decisionLogs.find((l) => l.surgery_id === selectedSurgeryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Algorithm Transparency & Explainability</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Algorithm Decision Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual breakdown of how Priority Queue, Constraint Checking, Job Sequencing, and Greedy Optimization determine assignments.
          </p>
        </div>

        {/* Algorithm Weight Formula Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-xs max-w-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Priority Queue Weight Formula
          </div>
          <div className="font-mono text-cyan-300 text-[11px]">
            Score = (Med &times; 40%) + (Urg &times; 25%) + (Deadline &times; 25%) + (Wait &times; 10%)
          </div>
        </div>
      </div>

      {/* STEP 1: Global Priority Queue Heap State */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-200">
              STEP 1: Priority Queue Extraction Order (Python heapq)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {queueItems.length} Surgeries Sorted by Composite Priority Score
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {queueItems.map((item, idx) => {
            const isSelected = item.surgery_id === selectedSurgeryId;
            return (
              <div
                key={idx}
                onClick={() => setSelectedSurgeryId(item.surgery_id)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 scale-[1.03]"
                    : "bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-400">#{item.rank}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      item.priority_level === "Emergency"
                        ? "bg-rose-500/30 text-rose-300"
                        : item.priority_level === "Critical"
                        ? "bg-orange-500/30 text-orange-300"
                        : "bg-cyan-500/30 text-cyan-300"
                    }`}
                  >
                    {item.priority_level}
                  </span>
                </div>
                <div className="font-bold text-xs mt-1 text-white truncate">{item.surgery_id}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.surgery_name}</div>
                <div className="mt-1.5 pt-1 border-t border-slate-700/50 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Score</span>
                  <span className="font-mono font-bold text-cyan-300">{item.priority_score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Surgery Pipeline Deep Dive */}
      {activeStep && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Decision Pipeline for: <span className="text-cyan-400">{activeStep.surgery_id}</span> - {activeStep.surgery_name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {activeStep.patient_name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Duration: <strong className="text-slate-200">{activeStep.duration_minutes} min</strong> &bull; Deadline: <strong className="text-amber-400">{activeStep.deadline}</strong> &bull; Priority Score: <strong className="text-cyan-400">{activeStep.priority_score}</strong>
              </p>
            </div>

            <button
              onClick={() => onSelectSurgery({ ...(activeSurgery || {}), ...activeLog })}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>5-Question Answer Card</span>
            </button>
          </div>

          {/* Sequential Step Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* STEP 2: Selected from Queue */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Select from Queue
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-cyan-300">{activeStep.surgery_id}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{activeStep.surgery_name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Popped from heap due to top score: <strong className="text-white">{activeStep.priority_score}</strong>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 mt-3 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Selected for assignment</span>
              </div>
            </div>

            {/* STEP 3: Compatible Rooms Filter */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Room Compatibility
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {activeStep.compatible_rooms?.map((rm, i) => (
                    <div key={i} className="flex items-center space-x-1.5 text-emerald-300 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{rm}</span>
                    </div>
                  ))}
                  {activeStep.rejected_rooms?.map((rej, i) => (
                    <div key={i} className="flex items-start space-x-1.5 text-rose-300 bg-rose-950/20 px-2 py-1 rounded border border-rose-800/40 text-[10px]">
                      <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="truncate">{rej.room_name}: {rej.reason}</span>
                    </div>
                  ))}
                  {!activeStep.compatible_rooms?.length && !activeStep.rejected_rooms?.length && (
                    <div className="text-slate-500 text-xs italic">All rooms evaluated</div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-3">
                {activeStep.compatible_rooms?.length || 0} room(s) compatible
              </div>
            </div>

            {/* STEP 4 & 5: Feasible Candidate Slots & Scoring */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
                    4-5
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Job Sequencing Slots
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] max-h-36 overflow-y-auto pr-1">
                  {activeStep.candidate_slots && activeStep.candidate_slots.length > 0 ? (
                    activeStep.candidate_slots.map((c, i) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between items-center"
                      >
                        <span className="text-slate-300 text-[10px] truncate max-w-[110px]">
                          {c.room_name} ({c.start_time}-{c.end_time})
                        </span>
                        <span className="font-mono text-cyan-300 font-bold text-[10px]">
                          +{c.score}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded bg-amber-950/20 border border-amber-800/40 text-amber-300 text-[10px]">
                      No feasible slot found before deadline.
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-3">
                Evaluated candidate scoring & idle gaps
              </div>
            </div>

            {/* STEP 6 & 7: Greedy Selection Result */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
                    6-7
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Greedy Selection
                  </span>
                </div>

                {activeStep.decision === "SCHEDULED" ? (
                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/50">
                    <div className="text-xs font-bold text-emerald-300">
                      {activeStep.selected_candidate?.room_name}
                    </div>
                    <div className="font-mono text-teal-300 font-bold text-xs mt-1">
                      {activeStep.selected_candidate?.start_time} - {activeStep.selected_candidate?.end_time}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1">
                      Optimal candidate score: <strong className="text-white">{activeStep.selected_candidate?.score}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-800/50">
                    <div className="text-xs font-bold text-amber-300">UNSCHEDULED</div>
                    <div className="text-[10px] text-amber-200 mt-1">{activeStep.reason}</div>
                    {activeStep.suggested_slot && (
                      <div className="text-[10px] text-cyan-300 mt-1.5 font-medium">
                        Suggested: {activeStep.suggested_slot}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 mt-3">
                Schedule matrix updated
              </div>
            </div>
          </div>

          {/* Full Narrative Reason */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
            <span className="font-bold text-cyan-300">Comprehensive Algorithm Narrative: </span>
            <span className="text-slate-300 leading-relaxed">{activeStep.reason}</span>
          </div>
        </div>
      )}
    </div>
  );
};
