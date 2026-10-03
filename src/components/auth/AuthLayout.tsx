import React from "react";
import { AuthVisualSide } from "./AuthVisualSide";
import { LoginCard } from "./LoginCard";
import { Logo } from "./Logo";

interface AuthLayoutProps {
  onLogin: (email: string, pass: string) => Promise<any>;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Main Two-Column Container */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch">
        {/* Left Side: Healthcare & OR Visual Showcase (Desktop & Tablet) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-7/12">
          <AuthVisualSide />
        </div>

        {/* Right Side: Authentication Card */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 py-8 sm:py-12 relative z-10">
          {/* Mobile Top Header (Displayed only on mobile screens when left side is hidden) */}
          <div className="lg:hidden w-full max-w-md mx-auto mb-6 text-center space-y-2">
            <div className="flex justify-center">
              <Logo size="md" showText={false} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              SMART OR SCHEDULER
            </h1>
            <p className="text-xs text-cyan-300 font-medium">
              Operating Room Scheduling & Optimization System
            </p>
            <p className="text-[11px] text-slate-400">
              Smarter Scheduling. Better Resource Utilization.
            </p>
          </div>

          {/* Login Card */}
          <LoginCard onLogin={onLogin} />
        </div>
      </div>

      {/* Unified Professional Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 space-y-1 relative z-20">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3">
          <span>&copy; 2026 Smart OR Scheduler</span>
          <span className="hidden sm:inline" aria-hidden="true">&bull;</span>
          <span>Operating Room Scheduling & Optimization Prototype</span>
        </div>
        <div className="text-[10px] text-slate-600">
          Clinical Engineering & Decision Optimization &bull; Python Core Execution
        </div>
      </footer>
    </div>
  );
};
