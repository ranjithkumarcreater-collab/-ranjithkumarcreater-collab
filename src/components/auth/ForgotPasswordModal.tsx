import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, X } from "lucide-react";
import { EmailInput } from "./EmailInput";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = ""
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    // Simulate secure reset link dispatch
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setEmail("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={handleResetForm}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Enter your hospital account email address to receive secure reset credentials.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 text-teal-200 text-xs space-y-2 text-left">
              <div className="flex items-center space-x-2 font-bold text-teal-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                If an account exists for <strong className="text-white font-mono">{email}</strong>, password reset instructions will be provided. Please check your medical staff inbox.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <EmailInput
              value={email}
              onChange={(val) => {
                setEmail(val);
                if (error) setError(null);
              }}
              error={error}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition disabled:opacity-60"
            >
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
