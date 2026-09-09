import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/password/reset", { email, newPassword });
      alert("Password Reset Successful");
      navigate("/");
    } catch {
      alert("Reset Failed");
    }
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
      <p className="mt-2 text-gray-600">For: {email}</p>
      <input type="password" placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default ResetPassword;
