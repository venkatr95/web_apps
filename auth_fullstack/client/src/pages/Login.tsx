import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"password" | "pin">("password");
  const [form, setForm] = useState({ identifier: "", passwordOrPin: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMethod = () => {
    setMethod(method === "password" ? "pin" : "password");
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        ...form,
        method,
      });
      alert("Login Successful");
      console.log(res.data);
      setTimeout(() => navigate("/home"), 1500);
    } catch {
      alert("Login Failed");
    }
  };

  return (
    <div className="container">
      <input name="identifier" placeholder="Email or Phone" onChange={handleChange} className="border p-2 rounded" />
      <input
        name="passwordOrPin"
        type={method === "password" ? "password" : "text"}
        placeholder={method === "password" ? "Password" : "PIN"}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* 👇 Forgot Password Link only shows when using password method */}
      {method === "password" && (
        <Link to="/forgot-password" className="text-blue-200 text-sm hover:underline">
          Forgot Password?
        </Link>
      )}

      <button onClick={toggleMethod} className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded">
        Use {method === "password" ? "PIN" : "Password"}
      </button>

      <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        Login
      </button>
    </div>
  );
};

export default Login;
