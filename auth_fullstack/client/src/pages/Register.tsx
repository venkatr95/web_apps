import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/register.css";
import Popup from "../components/Popup";

interface RegisterFormData {
  email: string;
  phone: string;
  pin: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}

const Register: React.FC = () => {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormData>({
    email: "",
    phone: "",
    pin: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (field: string, value: string) => {
    switch (field) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format";
      case "pin":
        return /^\d{6}$/.test(value) ? "" : "PIN must be 6 digits";
      case "phone":
        return /^\d{10}$/.test(value) ? "" : "Phone Number must be 10 digits";
      case "password":
        return value.length >= 6 ? "" : "Minimum 6 characters";
      case "confirmPassword":
        return value === form.password ? "" : "Passwords do not match";
      case "securityQuestion":
        return value ? "" : "Please select a question";
      case "securityAnswer":
        return value ? "" : "Answer cannot be empty";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    const error = validate(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => Object.values(errors).every((e) => e === "") && Object.values(form).every((v) => v !== "");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fix errors");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:5000/api/auth/register", form);
      toast.success("Registered successfully");
      setForm({
        email: "",
        phone: "",
        pin: "",
        password: "",
        confirmPassword: "",
        securityQuestion: "",
        securityAnswer: "",
      });
      setErrors({});
      // navigate('/login');
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setPopupMessage("Registration failed. Please try again.");
      console.log(popupMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {popupMessage && (
        <Popup
          message={popupMessage}
          type={popupMessage.includes("success") ? "success" : "error"}
          onClose={() => setPopupMessage(null)}
        />
      )}

      <motion.form className="styled-form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        {[
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "PIN", name: "pin", type: "text" },
          { label: "Password", name: "password", type: "password" },
          {
            label: "Confirm Password",
            name: "confirmPassword",
            type: "password",
          },
        ].map(({ label, name, type }) => (
          <div className={`form-group ${errors[name] ? "error" : ""}`} key={name}>
            <label>{label}</label>
            <input type={type} name={name} value={(form as any)[name]} onChange={handleChange} placeholder={label} />
            {errors[name] && <span className="support-text">❗ {errors[name]}</span>}
          </div>
        ))}

        <div className={`form-group ${errors.securityQuestion ? "error" : ""}`}>
          <label>Security Question</label>
          <select name="securityQuestion" value={form.securityQuestion} onChange={handleChange}>
            <option value="">Select a question</option>
            <option value="pet">What is your pet's name?</option>
            <option value="school">What was your first school?</option>
            <option value="city">In what city were you born?</option>
          </select>
          {errors.securityQuestion && <span className="support-text">❗ {errors.securityQuestion}</span>}
        </div>

        <div className={`form-group ${errors.securityAnswer ? "error" : ""}`}>
          <label>Security Answer</label>
          <input
            type="text"
            name="securityAnswer"
            value={form.securityAnswer}
            onChange={handleChange}
            placeholder="Security Answer"
          />
          {errors.securityAnswer && <span className="support-text">❗ {errors.securityAnswer}</span>}
        </div>

        <button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </motion.form>
    </>
  );
};

export default Register;
