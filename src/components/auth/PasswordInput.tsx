import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  disabled,
  placeholder = "Enter your password",
  label = "Password"
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex justify-between items-center">
        <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
        {value.length > 0 && (
          <span className="text-[10px] text-slate-400 font-mono">
            {value.length >= 6 ? "Minimum length satisfied" : "Min 6 chars"}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>
        <input
          id="auth-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-all focus:outline-none ${
            error
              ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30"
              : "border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
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
