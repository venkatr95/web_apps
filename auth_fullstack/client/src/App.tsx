import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from "react-toastify";
import "./App.css";
import { useContext, useEffect } from "react";
import { Context } from "./main";
import Auth from "./pages/Auth";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";

export const App = () => {
  // const { setIsAuthenticated, setUser } = useContext(Context);

  // useEffect(() => {
  //   const getUser = async () => {
  //     await axios
  //       .get("http://localhost:4000/api/v1/user/me", { withCredentials: true })
  //       .then((res) => {
  //         setUser(res.data.user);
  //         setIsAuthenticated(true);
  //       })
  //       .catch((err) => {
  //         setUser(null);
  //         setIsAuthenticated(false);
  //       });
  //   };
  //   getUser();
  // }, []);

  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <ToastContainer theme="colored" />
      {/* <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/otp-verification/:email/:phone"
            element={<OtpVerification />}
          />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
        </Routes>
        <ToastContainer theme="colored" />
      </Router> */}
    </>
  );
};

export default App;
