import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Hospital,
  Activity,
  TrendingUp,
  Cpu,
  Layers,
  Play,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Timer,
  Zap
} from "lucide-react";
import { Surgery, OperatingRoom, ScheduledSurgery, AnalyticsData, DecisionLog, User } from "../types";

interface DashboardViewProps {
  surgeries: Surgery[];
  rooms: OperatingRoom[];
  scheduled: ScheduledSurgery[];
  analytics: AnalyticsData | null;
  decisionLogs: DecisionLog[];
  onRunDemo: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectSurgery: (s: any) => void;
  currentUser: User | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  surgeries,
  rooms,
  scheduled,
  analytics,
  decisionLogs,
  onRunDemo,
  onNavigateTab,
  onSelectSurgery,
  currentUser
}) => {
  const totalSurgeries = surgeries.length;
  const scheduledCount = scheduled.length;
  const unscheduledCount = surgeries.filter((s) => s.status === "Unscheduled").length;
  const emergencyCount = surgeries.filter((s) => s.priority_level === "Emergency").length;

  const roomUtilPct = analytics?.overall_room_utilization_pct ?? 0;
  const deadlineCompliancePct = analytics?.deadline_compliance_pct ?? 100;
  const avgWaitMins = analytics?.average_waiting_time_minutes ?? 0;
  const totalIdleHours = analytics?.total_idle_hours ?? 0;
  const objectiveScore = analytics?.objective?.normalized_score ?? 0;

  // Priority count breakdown
  const priorityCounts = {
    Emergency: surgeries.filter((s) => s.priority_level === "Emergency").length,
    Critical: surgeries.filter((s) => s.priority_level === "Critical").length,
    High: surgeries.filter((s) => s.priority_level === "High").length,
    Medium: surgeries.filter((s) => s.priority_level === "Medium").length,
    Low: surgeries.filter((s) => s.priority_level === "Low").length
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Algorithms: Priority Queue &bull; Job Sequencing &bull; Greedy Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart OR Scheduler
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Automatically sequences and assigns hospital surgeries to operating rooms and discrete continuous
            time windows while respecting priorities, surgeon schedules, specialized equipment, room types, and strict medical deadlines.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {currentUser?.role !== "Viewer" && (
              <button
                onClick={onRunDemo}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current text-cyan-200" />
                <span>RUN ONE-CLICK OPTIMIZATION DEMO</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab("decision_center")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Inspect Decision Logic</span>
            </button>
            <button
              onClick={() => onNavigateTab("schedule")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>View Timeline</span>
            </button>
          </div>
        </div>

        {/* Futuristic Background Accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Surgeries */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Cases</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-white">{totalSurgeries}</div>
          <span className="text-[10px] text-slate-400">In pool</span>
        </div>

        {/* 2. Scheduled */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Scheduled</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-emerald-400">{scheduledCount}</div>
          <span className="text-[10px] text-emerald-500/80 font-medium">
            {totalSurgeries ? Math.round((scheduledCount / totalSurgeries) * 100) : 0}% success
          </span>
        </div>

        {/* 3. Unscheduled */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unscheduled</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-amber-400">{unscheduledCount}</div>
          <span className="text-[10px] text-amber-500/80 font-medium">Constraints tight</span>
        </div>

        {/* 4. Emergency */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Emergency</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-rose-400">{emergencyCount}</div>
          <span className="text-[10px] text-rose-400 font-medium">Top Priority</span>
        </div>

        {/* 5. Operating Rooms */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active ORs</span>
            <Hospital className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-indigo-400">{rooms.length}</div>
          <span className="text-[10px] text-slate-400">Suites available</span>
        </div>

        {/* 6. Room Utilization */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">OR Util</span>
            <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-teal-400">{roomUtilPct}%</div>
          <span className="text-[10px] text-slate-400">Active hours</span>
        </div>

        {/* 7. Deadline Compliance */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Deadline</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-cyan-400">{deadlineCompliancePct}%</div>
          <span className="text-[10px] text-slate-400">On time</span>
        </div>

        {/* 8. Avg Waiting Time */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Wait</span>
            <Timer className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-purple-300">{avgWaitMins}m</div>
          <span className="text-[10px] text-slate-400">From requested</span>
        </div>
      </div>

      {/* Middle Section: Priority Distribution & Room Utilization Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">Surgeries by Priority Level</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{totalSurgeries} Total</span>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: "Emergency", count: priorityCounts.Emergency, color: "bg-rose-500", text: "text-rose-400", weight: "Score: 5" },
              { label: "Critical", count: priorityCounts.Critical, color: "bg-orange-500", text: "text-orange-400", weight: "Score: 4" },
              { label: "High", count: priorityCounts.High, color: "bg-blue-500", text: "text-blue-400", weight: "Score: 3" },
              { label: "Medium", count: priorityCounts.Medium, color: "bg-cyan-500", text: "text-cyan-400", weight: "Score: 2" },
              { label: "Low", count: priorityCounts.Low, color: "bg-slate-500", text: "text-slate-400", weight: "Score: 1" },
            ].map((p) => {
              const pct = totalSurgeries ? (p.count / totalSurgeries) * 100 : 0;
              return (
                <div key={p.label} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold ${p.text}`}>{p.label}</span>
                    <span className="text-slate-400 font-mono">
                      {p.count} cases ({Math.round(pct)}%) &bull; <span className="text-slate-500">{p.weight}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${p.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-300">
            <span className="font-semibold text-cyan-300">Priority Queue Rule: </span>
            Surgeries with higher composite priority score are extracted first from the <span className="font-mono text-cyan-200">heapq</span> priority queue before evaluating room candidates.
          </div>
        </div>

        {/* Operating Room Tracks Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Hospital className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-200">Operating Room Utilization & Status</h3>
            </div>
            <button
              onClick={() => onNavigateTab("schedule")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
            >
              <span>View Interactive Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map((room) => {
              const roomSchedules = scheduled.filter((s) => s.room_id === room.id);
              const roomUtilMetric = analytics?.room_utilization_breakdown?.find((r) => r.room_id === room.id);
              const utilPct = roomUtilMetric?.utilization_pct ?? 0;
              const usedHours = roomUtilMetric?.used_hours ?? 0;
              const availHours = roomUtilMetric?.available_hours ?? 9;

              return (
                <div key={room.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{room.room_name}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {room.room_type} OR &bull; {room.opening_time} - {room.closing_time}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-teal-400">{utilPct}%</span>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, utilPct)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                      <span>Used: <strong className="text-slate-200">{usedHours}h</strong> / {availHours}h</span>
                      <span><strong className="text-slate-200">{roomSchedules.length}</strong> surgeries booked</span>
                    </div>
                  </div>

                  {/* Scheduled items preview */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1">
                    {roomSchedules.slice(0, 3).map((s) => (
                      <span
                        key={s.surgery_id}
                        onClick={() => onSelectSurgery(s)}
                        className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-500 transition"
                        title={`${s.surgery_name} (${s.start_time} - ${s.end_time})`}
                      >
                        {s.surgery_id}: {s.start_time}
                      </span>
                    ))}
                    {roomSchedules.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{roomSchedules.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Scheduling Decisions Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">Latest Algorithm Decision Logs</h3>
          </div>
          <button
            onClick={() => onNavigateTab("decision_center")}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
          >
            <span>Full Decision Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {decisionLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No scheduling logs yet. Click <span className="text-cyan-300 font-semibold">"RUN DEMO"</span> above to generate optimal assignments!
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-3 font-semibold">Surgery</th>
                  <th className="py-2 px-3 font-semibold">Priority Score</th>
                  <th className="py-2 px-3 font-semibold">Candidate Rooms</th>
                  <th className="py-2 px-3 font-semibold">Assigned Room & Slot</th>
                  <th className="py-2 px-3 font-semibold">Result</th>
                  <th className="py-2 px-3 font-semibold">Algorithm Reason</th>
                  <th className="py-2 px-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {decisionLogs.slice(0, 6).map((log, idx) => {
                  const isScheduled = log.decision === "SCHEDULED";
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-200">{log.surgery_id}</div>
                        <div className="text-[11px] text-slate-400">{log.surgery_name}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                          {log.priority_score}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.candidate_rooms?.length ? log.candidate_rooms.join(", ") : "None"}
                      </td>
                      <td className="py-2.5 px-3">
                        {isScheduled ? (
                          <div>
                            <span className="font-semibold text-slate-200">{log.selected_room}</span>
                            <span className="text-[11px] text-teal-400 font-mono ml-1.5">
                              {log.selected_start} - {log.selected_end}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isScheduled
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {log.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-300" title={log.reason}>
                        {log.reason}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            const match = surgeries.find((s) => s.id === log.surgery_id);
                            onSelectSurgery({ ...(match || {}), ...log });
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium border border-slate-700 transition"
                        >
                          Explain
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
