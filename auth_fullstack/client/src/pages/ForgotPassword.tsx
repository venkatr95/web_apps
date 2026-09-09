import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [securityMode, setSecurityMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [pinAttempts, setPinAttempts] = useState(0);
  const [answerAttempts, setAnswerAttempts] = useState(0);

  const checkPin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/password/forgot",
        { email, pin },
        { withCredentials: false }
      );

      if (res.data.message === "PIN verified") {
        alert("PIN verified");
        navigate(`/reset-password?email=${email}`);
      }
    } catch (err: any) {
      const message = err.response?.data?.message;

      if (message === "Too many attempts. Answer security question.") {
        try {
          const user = await axios.get(`http://localhost:5000/api/users/security-question?email=${email}`);
          setQuestion(user.data.securityQuestion);
          setSecurityMode(true);
        } catch (fetchErr: any) {
          alert("Failed to load security question");
          console.error(fetchErr);
        }
      } else {
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);
        alert(message || "Invalid PIN");
      }
    }
  };

  const checkAnswer = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/password/verify-answer", {
        email,
        answer,
      });

      if (res.data.message === "Security answer correct") {
        alert("Answer verified");
        navigate(`/reset-password?email=${email}`);
      } else {
        const newAttempts = answerAttempts + 1;
        setAnswerAttempts(newAttempts);

        if (newAttempts >= 3) {
          alert("Too many wrong answers. Sending password reset email.");
          await sendEmail();
        } else {
          alert("Incorrect answer. Try again.");
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error verifying answer");
    }
  };

  const sendEmail = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/password/send-email", {
        email,
      });
      alert(res.data.message || "Reset email sent!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send email");
    }
  };

  return (
    <div className="container flex flex-col gap-4 max-w-md mx-auto mt-20 p-4 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      {!securityMode ? (
        <>
          <input
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={checkPin} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Verify PIN
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700">
            Security Question: <strong>{question}</strong>
          </p>
          <input
            placeholder="Enter Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={checkAnswer} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Submit Answer
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
