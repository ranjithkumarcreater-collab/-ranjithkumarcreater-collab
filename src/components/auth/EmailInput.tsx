import React from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  error,
  disabled
}) => {
  const isValidFormat = value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex justify-between items-center">
        <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-300">
          Hospital Email Address
        </label>
        {isValidFormat && !error && (
          <span className="text-[10px] text-teal-400 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Format Valid</span>
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Mail className="w-4 h-4" />
        </div>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          disabled={disabled}
          placeholder="Enter your email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-all focus:outline-none ${
            error
              ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
              : isValidFormat
              ? "border-teal-500/60 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
              : "border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      </div>

      {error && (
        <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
