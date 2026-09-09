import { ChefHat } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Auth.css";
import ThemeToggle from "./ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <ThemeToggle />
        <Link to="/" className="auth-logo">
          <ChefHat className="auth-logo-icon" />
        </Link>
        <h2 className="auth-title">{title}</h2>
        <p className="auth-subtitle">{subtitle}</p>
      </div>

      <div className="auth-form-container">
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
