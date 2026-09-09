import React, { useState } from "react";
import { requestOtp } from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Props {
  setEmail: (email: string) => void;
}

const LoginForm: React.FC<Props> = ({ setEmail }) => {
  const [emailInput, setEmailInput] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    try {
      await requestOtp(emailInput);
      toast.success("OTP sent to your email", {
        autoClose: 2000, // Toast will close after 2 second
      });
      setEmail(emailInput);
      setTimeout(() => {
        navigate("/otp");
      }, 3000);
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  return (
    <div className="login-form">
      <h2>Login with OTP</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        required
      />
      <button onClick={handleRequestOtp}>Request OTP</button>
    </div>
  );
};

export default LoginForm;
