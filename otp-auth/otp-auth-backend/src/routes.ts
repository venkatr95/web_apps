import express from "express";
import { requestOTP, verifyOTPAndLogin } from "./authController";

const router = express.Router();

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTPAndLogin);

export default router;
