import React, { useState, useEffect } from "react";
import {
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";
import { RememberMe } from "./RememberMe";
import { LoginButton } from "./LoginButton";
import { ErrorMessage } from "./ErrorMessage";
import { DemoLoginModal } from "./DemoLoginModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { UserRole } from "../../types";

interface LoginCardProps {
  onLogin: (email: string, pass: string) => Promise<any>;
}

const REMEMBERED_EMAIL_KEY = "smart_or_remembered_email";

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Load remembered email on mount if exists
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Please enter your email.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError(null);

    try {
      // Real API authentication call
      await onLogin(email.trim(), password);

      // Save or clear remember-me email safely (never password)
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // ignore
      }

      setIsSuccess(true);
      // Brief pause to display "Login Successful" before parent redirects to /dashboard
      await new Promise((r) => setTimeout(r, 650));
    } catch (err: any) {
      setAuthError(err.message || err.error || "Invalid login details.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail: string, demoPass: string, roleName: string) => {
    setIsDemoModalOpen(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setDemoNotice(`Entering Demo Mode as ${roleName}...`);
    setIsLoading(true);

    try {
      await onLogin(demoEmail, demoPass);
      setIsSuccess(true);
      await new Promise((r) => setTimeout(r, 600));
    } catch (err: any) {
      setAuthError(err.message || "Demo login failed");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
      setDemoNotice(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Login Card Container */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative z-10 text-slate-100 space-y-6">
        {/* Title */}
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to your hospital scheduling account
          </p>
        </div>

        {/* Global Error Banner */}
        <ErrorMessage message={authError} />

        {/* Demo Notice */}
        {demoNotice && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2 animate-pulse">
            <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{demoNotice}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <EmailInput
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (emailError) setEmailError(null);
              if (authError) setAuthError(null);
            }}
            error={emailError}
            disabled={isLoading || isSuccess}
          />

          <PasswordInput
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError(null);
              if (authError) setAuthError(null);
            }}
            error={passwordError}
            disabled={isLoading || isSuccess}
          />

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <RememberMe
              checked={rememberMe}
              onChange={setRememberMe}
              disabled={isLoading || isSuccess}
            />

            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Sign In Button */}
          <div className="pt-2">
            <LoginButton
              isLoading={isLoading}
              isSuccess={isSuccess}
            />
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            OR
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Try Demo Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            disabled={isLoading || isSuccess}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 transition-all flex items-center justify-center space-x-2 group shadow-sm active:scale-[0.99]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Try Demo (Admin &bull; Scheduler &bull; Viewer)</span>
          </button>
        </div>

        {/* Security UI Indicator */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Secure access for authorized users</span>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoLoginModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectRole={handleDemoSelect}
        isSubmitting={isLoading}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
