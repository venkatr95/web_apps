import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import { requestOTP, verifyOTPAndLogin } from "./authController";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Connect to MongoDB
connectDB();

// Enable CORS for your frontend's origin
app.use(
  cors({
    origin: "http://localhost:4200", // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow necessary HTTP methods
    credentials: true, // Allow cookies or credentials to be sent (optional)
  })
);

// OTP Endpoints
app.post("/request-otp", requestOTP);
app.post("/verify-otp", verifyOTPAndLogin);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
