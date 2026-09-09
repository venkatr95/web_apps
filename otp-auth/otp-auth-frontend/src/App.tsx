import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import OtpForm from "./components/OtpForm";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./components/LoginForm.css";
import "./components/OtpForm.css";

const App: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/otp" element={<OtpForm email={email} />} />
        <Route path="/login" element={<LoginForm setEmail={setEmail} />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
