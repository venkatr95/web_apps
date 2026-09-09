import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import ModalDialog from "../../components/shared/ModalDialog";
import { setToken, setUser } from "../../store/slices/authSlice";
import "../../styles/Auth.css";

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Registration failed");
      }

      const data = await response.json();

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      setIsSuccessModal(true);
      setModalMessage("Registration successful!");
      setShowModal(true);
      navigate("/login");
    } catch (err) {
      setIsSuccessModal(false);
      setModalMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setShowModal(true);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join our community of food lovers"
    >
      <form className="auth-form-group" onSubmit={handleSubmit}>
        {error && <div className="auth-form-error">{error}</div>}

        <div className="auth-form-field">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="input-field"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

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
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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

        <div className="auth-form-field">
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="input-field"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <span
            className="password-icon"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div>
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <div className="auth-alternate">
          <span className="auth-alternate-text">Already have an account?</span>{" "}
          <Link to="/login" className="auth-alternate-link">
            Sign in
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

export default RegisterPage;
