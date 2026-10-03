import React from "react";
import {
  ShieldCheck,
  Clock,
  Eye,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Hospital,
  Cpu
} from "lucide-react";
import { UserRole } from "../../types";

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (email: string, pass: string, roleName: string) => void;
  isSubmitting?: boolean;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const demoRoles = [
    {
      role: "Admin" as UserRole,
      title: "Admin Demo",
      email: "admin@smartorscheduler.com",
      password: "admin123",
      icon: ShieldCheck,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      description: "Full clinical & system administration permissions",
      permissions: [
        "Add, edit, & delete surgeries",
        "Add & configure operating rooms",
        "Modify scheduling priority weights",
        "Execute core Python algorithms",
        "Access analytics & decision logs",
        "Manage users & reset schedules"
      ]
    },
    {
      role: "Scheduler" as UserRole,
      title: "Scheduler Demo",
      email: "scheduler@smartorscheduler.com",
      password: "scheduler123",
      icon: Clock,
      color: "from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-300",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      description: "Operating room coordinator & timetable manager",
      permissions: [
        "Enter new surgeries & cases",
        "Manage room closures & maintenance",
        "Run automated scheduling engine",
        "View timeline schedule & conflicts",
        "Inspect algorithm decisions & logs"
      ]
    },
    {
      role: "Viewer" as UserRole,
      title: "Viewer Demo",
      email: "viewer@smartorscheduler.com",
      password: "viewer123",
      icon: Eye,
      color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      description: "Read-only audit, quality assurance, & clinical review",
      permissions: [
        "View high-level executive dashboard",
        "Inspect operating room timeline",
        "Review resource utilization analytics",
        "Read 5-question decision explanations"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Select Prototype Demo Access</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore Smart OR Scheduler with pre-configured role permissions. No manual credentials needed.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles list */}
        <div className="py-4 space-y-3.5 overflow-y-auto pr-1">
          {demoRoles.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.role}
                onClick={() => !isSubmitting && onSelectRole(d.email, d.password, d.role)}
                className={`group p-4 rounded-xl border bg-gradient-to-r ${d.color} hover:border-cyan-400/80 transition-all cursor-pointer relative shadow-sm hover:shadow-md hover:scale-[1.01]`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-cyan-300 shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-white group-hover:text-cyan-200 transition">
                          {d.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${d.badgeColor}`}>
                          {d.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{d.email}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{d.description}</p>
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 group-hover:bg-cyan-500 group-hover:text-slate-950 border border-slate-700 group-hover:border-cyan-400 text-xs font-semibold text-slate-200 transition shrink-0 self-start sm:self-center"
                  >
                    <span>Launch as {d.role}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Permissions checklist */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  {d.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>Preset prototype mode &bull; Real Python engine execution</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
