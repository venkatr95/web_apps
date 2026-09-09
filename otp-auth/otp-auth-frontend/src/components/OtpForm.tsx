import React, { useState } from "react";
import { verifyOtp } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  email: string;
}

const OtpForm: React.FC<Props> = ({ email }) => {
  const [otpInput, setOtpInput] = useState("");
  const navigate = useNavigate();

  const handleVerifyOtp = async () => {
    try {
      const { token } = await verifyOtp(email, otpInput);
      localStorage.setItem("token", token); // Store JWT token
      toast.success("OTP verified, logged in successfully!", {
        autoClose: 2000, // Toast will close after 2 second
      });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="otp-form">
      <h2>Enter OTP</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otpInput}
        onChange={(e) => setOtpInput(e.target.value)}
        required
      />
      <button onClick={handleVerifyOtp}>Verify OTP</button>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default OtpForm;
