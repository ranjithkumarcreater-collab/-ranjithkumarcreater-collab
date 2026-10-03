import React from "react";

interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const RememberMe: React.FC<RememberMeProps> = ({ checked, onChange, disabled }) => {
  return (
    <label className="flex items-center space-x-2.5 cursor-pointer text-xs select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-slate-900 cursor-pointer accent-cyan-500"
      />
      <span className="text-slate-300 font-medium">Remember me</span>
    </label>
  );
};
