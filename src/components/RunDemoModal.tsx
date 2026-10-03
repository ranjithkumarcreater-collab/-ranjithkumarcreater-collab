import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Cpu,
  Layers,
  Calendar,
  AlertCircle,
  Sparkles,
  BarChart,
  X
} from "lucide-react";

interface RunDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  executeSchedulerPromise: () => Promise<any>;
}

const STEPS = [
  { id: 1, title: "Loading Surgeries & Operating Rooms", icon: Layers, desc: "Fetching pending cases, room specifications, and maintenance closures" },
  { id: 2, title: "Calculating Composite Priority Scores", icon: Sparkles, desc: "Evaluating Medical Priority (40%), Urgency (25%), Deadline (25%), Waiting Factor (10%)" },
  { id: 3, title: "Building Python Priority Queue (heapq)", icon: Cpu, desc: "Constructing max-heap for optimal candidate extraction order" },
  { id: 4, title: "Filtering Compatible Operating Rooms", icon: Layers, desc: "Verifying room types and equipment availability constraints" },
  { id: 5, title: "Searching Feasible Time Windows (Job Sequencing)", icon: Calendar, desc: "Scanning discrete contiguous intervals without splitting" },
  { id: 6, title: "Applying 8 Hard Constraints", icon: AlertCircle, desc: "Enforcing no-overlap, operating hours, maintenance windows, and deadlines" },
  { id: 7, title: "Executing Greedy Selection", icon: Sparkles, desc: "Assigning highest-priority surgery to earliest minimal-idle feasible slot" },
  { id: 8, title: "Saving Schedule Assignments & Decision Logs", icon: CheckCircle2, desc: "Storing room tracks, explainable reasons, and alternative rejections" },
  { id: 9, title: "Calculating Analytics & Objective Function", icon: BarChart, desc: "Computing Room Utilization, Deadline Compliance, and Objective Score" }
];

export const RunDemoModal: React.FC<RunDemoModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  executeSchedulerPromise
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsRunning(false);
      setError(null);
      setIsFinished(false);
      return;
    }

    let isMounted = true;
    setIsRunning(true);

    const runVisualSteps = async () => {
      try {
        // Step progression simulation aligned with background execution
        for (let i = 0; i < STEPS.length - 1; i++) {
          if (!isMounted) return;
          setCurrentStepIndex(i);
          await new Promise((r) => setTimeout(r, 280));
        }

        // Trigger real Python execution
        await executeSchedulerPromise();

        if (isMounted) {
          setCurrentStepIndex(STEPS.length - 1);
          await new Promise((r) => setTimeout(r, 350));
          setIsFinished(true);
          setIsRunning(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to execute scheduler pipeline");
          setIsRunning(false);
        }
      }
    };

    runVisualSteps();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Executing Scheduling Engine
              </h3>
              <p className="text-xs text-slate-400">
                Running Python Priority Queue & Greedy Job Sequencing
              </p>
            </div>
          </div>
          {(!isRunning || isFinished || error) && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>
              {isFinished
                ? "Optimization Complete!"
                : `Step ${currentStepIndex + 1} of ${STEPS.length}`}
            </span>
            <span className="text-cyan-400 font-semibold">
              {Math.round(((currentStepIndex + (isFinished ? 1 : 0)) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(((currentStepIndex + (isFinished ? 1 : 0)) / STEPS.length) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {STEPS.map((step, idx) => {
            const isCurrent = idx === currentStepIndex && isRunning;
            const isDone = idx < currentStepIndex || isFinished;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-2.5 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-sm"
                    : isDone
                    ? "bg-slate-800/40 border-slate-700/60 text-slate-300"
                    : "bg-slate-900/30 border-slate-800/60 text-slate-500"
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
                      {step.id}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{step.title}</div>
                  <div className="text-[11px] text-slate-400">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isFinished && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              View Generated Schedule & Explanation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
