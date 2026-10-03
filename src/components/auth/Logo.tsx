import React from "react";
import { Hospital, Calendar, Clock, Cross } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showText = true }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Hospital Cross + OR + Calendar integrated concept icon */}
      <div
        className={`relative flex items-center justify-center ${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30 shrink-0`}
      >
        <Hospital className={`${iconSizes[size]} text-white`} />
        {/* Subtle calendar corner badge */}
        <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-cyan-500/50 shadow-sm">
          <Calendar className="w-3 h-3 text-cyan-300" />
        </div>
      </div>

      {showText && (
        <div className="text-left">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
              SMART OR SCHEDULER
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-normal">
            Operating Room Scheduling & Optimization System
          </p>
        </div>
      )}
    </div>
  );
};
