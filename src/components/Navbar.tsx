import React from "react";
import {
  Calendar,
  Clock,
  Cpu,
  Layers,
  BarChart3,
  AlertTriangle,
  Settings,
  RotateCcw,
  Play,
  Database,
  User as UserIcon,
  LogOut,
  Hospital,
  Activity,
  History,
  FileText
} from "lucide-react";
import { User, UserRole } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout?: () => void;
  onRoleChange: (role: UserRole) => void;
  onRunSchedulerClick: () => void;
  onResetClick: () => void;
  onLoadDemoClick: () => void;
  unscheduledCount: number;
  scheduledCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onRoleChange,
  onRunSchedulerClick,
  onResetClick,
  onLoadDemoClick,
  unscheduledCount,
  scheduledCount
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "surgeries", label: "Surgeries", icon: Layers },
    { id: "rooms", label: "Operating Rooms", icon: Hospital },
    { id: "schedule", label: "Schedule", icon: Calendar, badge: scheduledCount > 0 ? scheduledCount : undefined },
    { id: "decision_center", label: "Algorithm Decision Center", icon: Cpu },
    { id: "unscheduled", label: "Unscheduled Surgeries", icon: AlertTriangle, badge: unscheduledCount > 0 ? unscheduledCount : undefined, badgeColor: "bg-amber-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "history", label: "Scheduling Runs", icon: History },
    { id: "decision_logs", label: "Decision Logs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 text-white shadow-md shadow-cyan-500/20">
              <Hospital className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border border-slate-900">
                <Clock className="w-3 h-3 text-cyan-200" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                  Smart OR Scheduler
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  Python Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI-Assisted Operating Room Scheduling & Optimization
              </p>
            </div>
          </div>

          {/* Quick Actions & User Role */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onLoadDemoClick}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              title="Load standard 16 surgeries and 4 OR suites"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Demo Data</span>
            </button>

            {currentUser?.role !== "Viewer" && (
              <button
                onClick={onResetClick}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Reset active schedule"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {currentUser?.role !== "Viewer" && (
              <button
                onClick={onRunSchedulerClick}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-600/30 transition transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Scheduler</span>
              </button>
            )}

            {/* User Profile & Direct Role Switcher */}
            <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-800 space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{currentUser?.name || "Dr. Alexander Wright"}</div>
                  <div className="text-[10px] text-cyan-400 font-medium">{currentUser?.role || "Admin"} Access</div>
                </div>
              </div>

              {/* Role Quick Selector */}
              <select
                value={currentUser?.role || "Admin"}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold px-2 py-1 text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                title="Switch active user role"
              >
                <option value="Admin">Admin (Full)</option>
                <option value="Scheduler">Scheduler</option>
                <option value="Viewer">Viewer (Read-Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.badgeColor || "bg-cyan-500/20 text-cyan-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
