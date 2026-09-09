import { Request, Response } from "express";
import { generateOTP, storeOTP, verifyOTP, removeOTP } from "./otpService";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import express from "express";
import asyncHandler from "./utils";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Transporter to send OTP emails
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates (optional)
  },
});

// Function to send OTP email
export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  };
  await transporter.sendMail(mailOptions);
};

// Request OTP endpoint
export const requestOTP = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
      // Generate OTP and store it in MongoDB and Redis
      const otp = generateOTP();
      await storeOTP(email, otp);

      // Send OTP to the user's email
      await sendOTPEmail(email, otp);

      return (
        res.status(200).json({ message: "OTP sent to your email" }) || undefined
      );
    } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error });
      throw error;
    }
  }
);

// Verify OTP and login
export const verifyOTPAndLogin = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    try {
      // Verify OTP
      const isValidOTP = await verifyOTP(email, otp);
      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Generate JWT token
      const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      // Remove OTP after successful login
      await removeOTP(email);

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Error verifying OTP", error });
    }
  }
);
