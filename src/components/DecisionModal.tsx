import React from "react";
import {
  X,
  HelpCircle,
  Clock,
  Hospital,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import { ScheduledSurgery, UnscheduledSurgery, DecisionLog } from "../types";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgery: ScheduledSurgery | UnscheduledSurgery | any;
  decisionLog?: DecisionLog | any;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  surgery,
  decisionLog
}) => {
  if (!isOpen || !surgery) return null;

  const isScheduled = surgery.status === "Scheduled" || surgery.status === "Confirmed";

  // Answers extraction or fallback formatting
  const sName = surgery.surgery_name || "Surgical Procedure";
  const pLevel = surgery.priority_level || "Medium";
  const uLevel = surgery.urgency_level || "Normal";
  const sId = surgery.id || surgery.surgery_id;
  const pScore = surgery.score || decisionLog?.priority_score || 0;

  const whySurgery =
    decisionLog?.answers?.why_this_surgery ||
    `Surgery ${sId} (${sName}) was prioritized because the Priority Queue calculated a composite score of ${pScore} based on its ${pLevel} medical priority and ${uLevel} urgency.`;

  const whyRoom =
    decisionLog?.answers?.why_this_room ||
    (isScheduled
      ? `${surgery.room_name || "The selected room"} was chosen because it meets all surgical specifications for ${surgery.required_room_type || surgery.surgery_type} and provides all required sterilized equipment.`
      : "No room could be assigned due to capacity or constraint limits.");

  const whyTime =
    decisionLog?.answers?.why_this_time ||
    (isScheduled
      ? `The time slot ${surgery.start_time} - ${surgery.end_time} satisfies the continuous ${surgery.duration_minutes}m duration, finishes before the ${surgery.deadline} deadline, and creates minimal idle gap.`
      : "No continuous block within operating hours met deadline.");

  const whyNotOther =
    decisionLog?.answers?.why_not_another_room ||
    "Alternative rooms either lacked required specialty equipment, had conflicting bookings, or caused greater idle downtime.";

  const whyUnscheduled =
    decisionLog?.answers?.why_unscheduled ||
    surgery.failure_reason ||
    "N/A - Surgery was successfully scheduled.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isScheduled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              {isScheduled ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">{sName}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 border border-slate-700 text-slate-300">
                  {sId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    pLevel === "Emergency"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : pLevel === "Critical"
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {pLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Patient: <span className="text-slate-200 font-medium">{surgery.patient_name}</span> ({surgery.patient_id}) &bull; Surgeon: <span className="text-slate-200">{surgery.surgeon_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Duration</span>
              <div className="text-sm font-bold text-slate-200 flex items-center space-x-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{surgery.duration_minutes} min</span>
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Time</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {isScheduled ? `${surgery.start_time} - ${surgery.end_time}` : "Unscheduled"}
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Deadline</span>
              <div className="text-sm font-bold text-amber-300 mt-0.5">{surgery.deadline}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Operating Room</span>
              <div className="text-sm font-bold text-cyan-300 truncate mt-0.5">
                {isScheduled ? surgery.room_name : "None"}
              </div>
            </div>
          </div>

          {/* 5 Explainable Questions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Algorithm Decision Breakdown (5 Core Questions)</span>
            </h4>

            {/* Q1 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <div className="font-semibold text-cyan-300 mb-1 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] text-cyan-300 font-bold">1</span>
                <span>Why was this surgery selected?</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5.5">{whySurgery}</p>
            </div>

            {/* Q2 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <div className="font-semibold text-cyan-300 mb-1 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] text-cyan-300 font-bold">2</span>
                <span>Why was this operating room selected?</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5.5">{whyRoom}</p>
            </div>

            {/* Q3 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <div className="font-semibold text-cyan-300 mb-1 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] text-cyan-300 font-bold">3</span>
                <span>What time was chosen and why?</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5.5">{whyTime}</p>
            </div>

            {/* Q4 */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <div className="font-semibold text-cyan-300 mb-1 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] text-cyan-300 font-bold">4</span>
                <span>Why were other candidate rooms/slots rejected?</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5.5">{whyNotOther}</p>
            </div>

            {/* Q5 */}
            {!isScheduled && (
              <div className="bg-amber-950/20 border border-amber-800/60 rounded-xl p-3">
                <div className="font-semibold text-amber-300 mb-1 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-900 border border-amber-600 flex items-center justify-center text-[10px] text-amber-200 font-bold">5</span>
                  <span>Why was this surgery left unscheduled?</span>
                </div>
                <p className="text-amber-200 leading-relaxed pl-5.5">{whyUnscheduled}</p>
                {surgery.suggested_slot && (
                  <div className="mt-2 pl-5.5 text-xs text-cyan-300 font-medium">
                    Suggested Next Slot: <span className="text-white underline">{surgery.suggested_slot}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Greedy Candidate Score Breakdown */}
          {surgery.breakdown && (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <div className="font-semibold text-slate-200 mb-1.5 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Greedy Candidate Formula Breakdown</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                {surgery.breakdown.breakdown_str}
              </p>
            </div>
          )}

          {/* Full Narrative Text */}
          {decisionLog?.full_text && (
            <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-300">Raw Decision Engine Log: </span>
              {decisionLog.full_text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
