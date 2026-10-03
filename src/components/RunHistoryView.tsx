import React from "react";
import {
  History,
  CheckCircle2,
  Calendar,
  BarChart3,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import { SchedulingRun } from "../types";

interface RunHistoryViewProps {
  runs: SchedulingRun[];
  onRerun: () => void;
}

export const RunHistoryView: React.FC<RunHistoryViewProps> = ({ runs, onRerun }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Comparative Optimization</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scheduling Run History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical benchmark log of all executed optimization runs, objective function outcomes, and efficiency metrics.
          </p>
        </div>

        <button
          onClick={onRerun}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30 transition self-start sm:self-auto"
        >
          <span>Run New Optimization</span>
        </button>
      </div>

      {runs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          No scheduling runs recorded yet. Execute the scheduler to record benchmark runs.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px]">
                  <th className="py-3 px-4 font-semibold">Run ID / Name</th>
                  <th className="py-3 px-4 font-semibold">Total Cases</th>
                  <th className="py-3 px-4 font-semibold">Scheduled / Unscheduled</th>
                  <th className="py-3 px-4 font-semibold">Objective Value</th>
                  <th className="py-3 px-4 font-semibold">OR Utilization</th>
                  <th className="py-3 px-4 font-semibold">Deadline Met</th>
                  <th className="py-3 px-4 font-semibold">Avg Waiting</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {runs.map((run) => {
                  const dateStr = run.created_at
                    ? new Date(run.created_at * 1000).toLocaleString()
                    : "Recently";

                  return (
                    <tr key={run.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{run.run_name}</div>
                        <div className="font-mono text-[10px] text-slate-500">{run.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold font-mono">
                        {run.total_surgeries}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-bold font-mono">
                          {run.scheduled_surgeries}
                        </span>
                        {" / "}
                        <span className="text-amber-400 font-bold font-mono">
                          {run.unscheduled_surgeries}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                        {run.objective_value} pts
                      </td>
                      <td className="py-3 px-4 font-mono text-teal-300">
                        {run.room_utilization}%
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300">
                        {run.deadline_compliance}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {run.average_waiting_time} min
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
