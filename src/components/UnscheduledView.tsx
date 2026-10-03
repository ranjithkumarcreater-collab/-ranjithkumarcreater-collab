import React from "react";
import {
  AlertTriangle,
  Clock,
  Hospital,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { UnscheduledSurgery, Surgery } from "../types";

interface UnscheduledViewProps {
  unscheduled: (UnscheduledSurgery | Surgery)[];
  onSelectSurgery: (s: any) => void;
  onNavigateTab: (tab: string) => void;
}

export const UnscheduledView: React.FC<UnscheduledViewProps> = ({
  unscheduled,
  onSelectSurgery,
  onNavigateTab
}) => {
  const unscheduledCases = unscheduled.filter(
    (s) => s.status === "Unscheduled" || (s as any).failure_reason
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Constraint Bottleneck Diagnostic</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Unscheduled Surgeries Diagnostic
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Detailed root-cause analysis for procedures that could not be scheduled due to tight deadlines, continuous duration needs, or missing specialized equipment.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-xs text-right">
          <span className="text-slate-400">Unscheduled Cases:</span>
          <div className="text-lg font-bold text-amber-400 font-mono">
            {unscheduledCases.length} Procedures
          </div>
        </div>
      </div>

      {unscheduledCases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">Zero Unscheduled Surgeries</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            All submitted surgical procedures have been accommodated into operating room schedules satisfying all hard constraints.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {unscheduledCases.map((s: any) => {
            const reason =
              s.failure_reason ||
              "No compatible operating room contains a continuous slot of sufficient duration before the required deadline.";

            const suggestedSlot = s.suggested_slot || "Next operating shift (all room working hours fully occupied)";

            return (
              <div
                key={s.id || s.surgery_id}
                className="bg-slate-900 border border-amber-800/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
              >
                {/* Accent border strip */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {s.id || s.surgery_id}
                      </span>
                      <h3 className="text-base font-bold text-white">{s.surgery_name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          s.priority_level === "Emergency"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : s.priority_level === "Critical"
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {s.priority_level}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/50">
                        UNSCHEDULED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Patient</span>
                        <div className="text-slate-200 font-medium truncate mt-0.5">
                          {s.patient_name} <span className="text-slate-400">({s.patient_id})</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Duration</span>
                        <div className="text-slate-200 font-bold font-mono mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{s.duration_minutes} min</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Deadline</span>
                        <div className="text-amber-300 font-bold font-mono mt-0.5">
                          {s.deadline}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Suite Required</span>
                        <div className="text-cyan-300 font-medium truncate mt-0.5">
                          {s.required_room_type || "General"} OR
                        </div>
                      </div>
                    </div>

                    {/* Failure Reason Box */}
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/50 text-xs">
                      <div className="font-bold text-amber-300 mb-1 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Algorithm Rejection Reason (Hard Constraints Enforced)</span>
                      </div>
                      <p className="text-amber-200/90 leading-relaxed pl-5">{reason}</p>
                    </div>

                    {/* Suggested Next Slot */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/50 text-xs">
                      <div className="font-bold text-cyan-300 mb-1 flex items-center space-x-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Optimization Recommendation / Next Feasible Window</span>
                      </div>
                      <p className="text-cyan-200 leading-relaxed pl-5">
                        Suggested Slot: <strong className="text-white underline">{suggestedSlot}</strong>.
                        To schedule immediately, consider relaxing the deadline, allocating an overtime extension, or moving elective non-urgent procedures.
                      </p>
                    </div>
                  </div>

                  {/* Right Button */}
                  <div className="flex sm:flex-col justify-end space-y-2 shrink-0">
                    <button
                      onClick={() => onSelectSurgery(s)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs flex items-center space-x-1 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Decision Trace</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab("decision_center")}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1 transition"
                    >
                      <span>All Steps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
