import React from "react";
import {
  Hospital,
  Calendar,
  Clock,
  Sparkles,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Logo } from "./Logo";

export const AuthVisualSide: React.FC = () => {
  return (
    <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/70 border-r border-slate-800/80">
      {/* Background radial glow accents */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Branding */}
      <div className="relative z-10 space-y-4">
        <Logo size="lg" showText={false} />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            SMART OR SCHEDULER
          </h1>
          <p className="text-sm font-semibold text-cyan-300">
            Operating Room Scheduling & Optimization System
          </p>
          <p className="text-xs text-slate-400 max-w-md pt-1 leading-relaxed">
            Smarter Scheduling. Better Resource Utilization.
          </p>
        </div>
      </div>

      {/* Middle: Simulated Medical Technology / Abstract Timeline Schedule Graphic */}
      <div className="relative z-10 my-8 space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-200">
                Operating Suite Live Timetable
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Discrete 30m Grid
            </span>
          </div>

          {/* Mini Interactive Timeline Representation */}
          <div className="space-y-2.5 text-[11px]">
            {/* Track 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">OR-1 General Suite</span>
                <span className="font-mono text-emerald-400">83% Utilized</span>
              </div>
              <div className="h-7 w-full bg-slate-950 rounded-lg p-1 border border-slate-800 flex space-x-1 overflow-hidden">
                <div className="h-full w-[40%] rounded bg-rose-500/25 border border-rose-500/50 flex items-center justify-center px-1 text-[9px] font-bold text-rose-300 truncate">
                  S101 Coronary (Emergency)
                </div>
                <div className="h-full w-[35%] rounded bg-blue-500/25 border border-blue-500/50 flex items-center justify-center px-1 text-[9px] font-bold text-blue-300 truncate">
                  S104 Laparoscopy (High)
                </div>
                <div className="h-full w-[25%] rounded bg-slate-800 border border-dashed border-slate-700 flex items-center justify-center text-[8px] text-slate-400">
                  Available
                </div>
              </div>
            </div>

            {/* Track 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">OR-2 Cardiac Suite</span>
                <span className="font-mono text-teal-400">75% Utilized</span>
              </div>
              <div className="h-7 w-full bg-slate-950 rounded-lg p-1 border border-slate-800 flex space-x-1 overflow-hidden">
                <div className="h-full w-[45%] rounded bg-orange-500/25 border border-orange-500/50 flex items-center justify-center px-1 text-[9px] font-bold text-orange-300 truncate">
                  S102 Bypass (Critical)
                </div>
                <div className="h-full w-[20%] rounded bg-amber-950/40 border border-amber-600/70 flex items-center justify-center px-1 text-[8px] font-bold text-amber-300 truncate">
                  Maintenance
                </div>
                <div className="h-full w-[35%] rounded bg-cyan-500/25 border border-cyan-500/50 flex items-center justify-center px-1 text-[9px] font-bold text-cyan-300 truncate">
                  S108 Valve (Medium)
                </div>
              </div>
            </div>
          </div>

          {/* Tri-Algorithm Feature Indicators */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-bold text-cyan-300">Priority Queue</div>
              <div className="text-[9px] text-slate-400">Max-Heap Sorting</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-bold text-teal-300">Job Sequencing</div>
              <div className="text-[9px] text-slate-400">Continuous Units</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-bold text-blue-300">Greedy Strategy</div>
              <div className="text-[9px] text-slate-400">Minimal Idle Gaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Medical System Trust Marks */}
      <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Clinical Operational Security</span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-500">
          <Activity className="w-3.5 h-3.5 text-cyan-500" />
          <span>v1.0.0 Real Python Engine</span>
        </div>
      </div>
    </div>
  );
};
