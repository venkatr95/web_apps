import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import ModalDialog from "../../components/shared/ModalDialog";
import { setToken, setUser } from "../../store/slices/authSlice";
import "../../styles/Auth.css";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      setIsSuccessModal(true);
      setModalMessage("Registration successful!");
      setShowModal(true);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form className="auth-form-group" onSubmit={handleSubmit}>
        {error && <div className="auth-form-error">{error}</div>}

        <div className="auth-form-field">
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input-field"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="auth-form-field">
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="input-with-icon">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="password-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="auth-remember">
          <div className="auth-remember-checkbox">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="auth-checkbox"
            />
            <label htmlFor="remember-me" className="auth-checkbox-label">
              Remember me
            </label>
          </div>

          <div className="auth-forgot-password">
            <Link to="/forgot-password" className="auth-forgot-password-link">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div className="auth-alternate">
          <span className="auth-alternate-text">Don't have an account?</span>{" "}
          <Link to="/register" className="auth-alternate-link">
            Sign up
          </Link>
        </div>
      </form>
      <ModalDialog
        show={showModal}
        onClose={() => {
          setShowModal(false);
          if (isSuccessModal) navigate("/");
        }}
        title={isSuccessModal ? "Success" : "Error"}
        message={modalMessage || ""}
      />
    </AuthLayout>
  );
};

export default LoginPage;
