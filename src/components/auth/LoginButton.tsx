import React from "react";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";

interface LoginButtonProps {
  isLoading: boolean;
  isSuccess: boolean;
  disabled?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading,
  isSuccess,
  disabled
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading || isSuccess}
      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg active:scale-[0.99] ${
        isSuccess
          ? "bg-emerald-600 text-white shadow-emerald-600/30"
          : isLoading
          ? "bg-cyan-700 text-cyan-100 shadow-cyan-900/30 cursor-wait"
          : "bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:via-teal-400 hover:to-blue-500 text-white shadow-cyan-600/25"
      } ${disabled && !isLoading && !isSuccess ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isSuccess ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
          <span>Login Successful. Redirecting...</span>
        </>
      ) : isLoading ? (
        <>
          <Loader2 className="w-4 h-4 text-cyan-200 animate-spin" />
          <span>Signing In...</span>
        </>
      ) : (
        <>
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  );
};
