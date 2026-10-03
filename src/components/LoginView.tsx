import React from "react";
import { AuthLayout } from "./auth/AuthLayout";

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<any>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return <AuthLayout onLogin={onLogin} />;
};

export default LoginView;
