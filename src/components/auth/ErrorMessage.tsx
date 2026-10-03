import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message?: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5 animate-in fade-in duration-150">
      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
      <span className="leading-snug">{message}</span>
    </div>
  );
};
