import React from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Hospital,
  Sparkles,
  Layers,
  ShieldCheck,
  Calculator,
  ArrowRight
} from "lucide-react";
import { AnalyticsData, ScheduledSurgery, Surgery } from "../types";

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  scheduled: ScheduledSurgery[];
  surgeries: Surgery[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  scheduled,
  surgeries
}) => {
  const total = surgeries.length;
  const scheduledCount = scheduled.length;
  const unscheduledCount = surgeries.filter((s) => s.status === "Unscheduled").length;

  const successRate = analytics?.success_rate_pct ?? (total ? Math.round((scheduledCount / total) * 100) : 0);
  const roomUtil = analytics?.overall_room_utilization_pct ?? 0;
  const deadlineCompliance = analytics?.deadline_compliance_pct ?? 100;
  const avgWait = analytics?.average_waiting_time_minutes ?? 0;
  const totalIdleHours = analytics?.total_idle_hours ?? 0;

  const objective = analytics?.objective;
  const objScore = objective?.normalized_score ?? 0;
  const rawObjScore = objective?.raw_objective_score ?? 0;
  const components = objective?.components;

  const priorityCounts = {
    Emergency: {
      scheduled: scheduled.filter((s) => s.priority_level === "Emergency").length,
      total: surgeries.filter((s) => s.priority_level === "Emergency").length
    },
    Critical: {
      scheduled: scheduled.filter((s) => s.priority_level === "Critical").length,
      total: surgeries.filter((s) => s.priority_level === "Critical").length
    },
    High: {
      scheduled: scheduled.filter((s) => s.priority_level === "High").length,
      total: surgeries.filter((s) => s.priority_level === "High").length
    },
    Medium: {
      scheduled: scheduled.filter((s) => s.priority_level === "Medium").length,
      total: surgeries.filter((s) => s.priority_level === "Medium").length
    },
    Low: {
      scheduled: scheduled.filter((s) => s.priority_level === "Low").length,
      total: surgeries.filter((s) => s.priority_level === "Low").length
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operational Research Metrics & KPIs</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Analytics & Objective Optimization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global objective function evaluation, room capacity utilization, deadline fulfillment, and idle gap analysis.
          </p>
        </div>

        {/* Global Objective Score Badge */}
        <div className="bg-slate-800/90 border border-cyan-500/30 p-4 rounded-2xl text-right shadow-lg">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Objective Function Score
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">
            {objScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-teal-400 font-medium">Raw: {rawObjScore} pts</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Success Rate */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">{successRate}%</div>
          <span className="text-[10px] text-slate-400">
            {scheduledCount} of {total} scheduled
          </span>
        </div>

        {/* Room Utilization */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">OR Utilization</span>
            <Hospital className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-teal-400">{roomUtil}%</div>
          <span className="text-[10px] text-slate-400">Used vs Available Hours</span>
        </div>

        {/* Deadline Compliance */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Deadline Met</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-cyan-400">{deadlineCompliance}%</div>
          <span className="text-[10px] text-slate-400">
            0 deadline violations
          </span>
        </div>

        {/* Average Waiting Time */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Waiting</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-300">{avgWait}m</div>
          <span className="text-[10px] text-slate-400">Actual start - Requested</span>
        </div>

        {/* Total Idle Time */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Idle Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-300">{totalIdleHours}h</div>
          <span className="text-[10px] text-slate-400">Unused gaps in open rooms</span>
        </div>
      </div>

      {/* SECTION 21: Objective Function Mathematical Decomposition */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200">
            Mathematical Objective Function Decomposition
          </h3>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-cyan-300">
          {objective?.formula ||
            "Objective Score = Priority Benefit - Waiting Penalty - Idle Penalty - Deadline Penalty - Unscheduled Penalty"}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Benefit: Priority */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              + Priority Benefit
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              +{components?.priority_benefit ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Sum of urgent & emergency surgeries scheduled early
            </p>
          </div>

          {/* Penalty: Waiting */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs">
            <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              - Waiting Time Penalty
            </div>
            <div className="text-xl font-bold font-mono text-rose-300 mt-1">
              -{components?.waiting_time_penalty ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {components?.total_waiting_hours ?? 0}h total patient delay
            </p>
          </div>

          {/* Penalty: Idle */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              - Idle Time Penalty
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              -{components?.idle_time_penalty ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {components?.total_idle_hours ?? 0}h fragmented downtime
            </p>
          </div>

          {/* Penalty: Deadline */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs">
            <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              - Deadline Violations
            </div>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">
              -{components?.deadline_violation_penalty ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {components?.deadline_violations_count ?? 0} late finishes
            </p>
          </div>

          {/* Penalty: Unscheduled */}
          <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-800/40 text-xs">
            <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
              - Unscheduled Penalty
            </div>
            <div className="text-xl font-bold font-mono text-orange-300 mt-1">
              -{components?.unscheduled_penalty ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {unscheduledCount} unassigned cases
            </p>
          </div>
        </div>
      </div>

      {/* Priority Fulfillment & Room Utilization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Fulfillment Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Priority Fulfillment (Raw Numbers & Ratios)
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(priorityCounts).map(([level, data]) => {
              const pct = data.total ? Math.round((data.scheduled / data.total) * 100) : 100;
              return (
                <div key={level} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">{level}</span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-cyan-300">{data.scheduled}</strong> / {data.total} scheduled ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-cyan-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Utilization Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Hospital className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Operating Room Efficiency Breakdown
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {analytics?.room_utilization_breakdown?.map((r) => (
              <div key={r.room_id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-200">{r.room_name}</span>
                  <span className="font-mono text-teal-400">{r.utilization_pct}%</span>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Used: <strong className="text-slate-200">{r.used_hours}h</strong> / {r.available_hours}h</span>
                  <span>Idle Gaps: <strong className="text-amber-300">{r.idle_hours}h</strong></span>
                  <span>Surgeries: <strong className="text-cyan-300">{r.surgeries_count}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
