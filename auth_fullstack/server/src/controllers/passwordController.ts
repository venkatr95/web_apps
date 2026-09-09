import { Request, Response } from "express";
import { User } from "../models/User";
import { hashValue } from "../utils/helpers";

const pinAttempts: Record<string, number> = {};
const securityAttempts: Record<string, number> = {};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const hashedPassword = hashValue(newPassword);
  await User.findOneAndUpdate({ email }, { password: hashedPassword });
  res.status(200).json({ message: "Password reset successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email, pin } = req.body;
  const user = await User.findOne({ email });

  let responseSent = false;

  if (!user) {
    res.status(404).json({ message: "User not found" });
    responseSent = true;
  }

  const attempts = pinAttempts[email] ?? 0;

  if (!responseSent && attempts >= 3) {
    res.status(403).json({ message: "Too many attempts. Answer security question." });
    responseSent = true;
  }

  if (!responseSent && hashValue(pin) === user?.pin) {
    pinAttempts[email] = 0;
    res.status(200).json({ message: "PIN verified" });
    responseSent = true;
  }

  if (!responseSent) {
    pinAttempts[email] = attempts + 1;
    res.status(401).json({ message: "Incorrect pin" });
  }
};

export const verifySecurityAnswer = async (req: Request, res: Response) => {
  const { email, answer } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const storedAnswer = Buffer.from(user.securityAnswer, "base64").toString().toLowerCase();
  const attempts = securityAttempts[email] ?? 0;

  if (attempts >= 3) {
    if (user.category !== "Basic") {
      res.status(403).json({ message: "Too many attempts. Reset link sent to email." });
    }
    return res.status(403).json({ message: "Too many attempts. Contact support." });
  }

  if (storedAnswer === answer.toLowerCase()) {
    securityAttempts[email] = 0;
    res.status(200).json({ message: "Security answer correct" });
  }

  securityAttempts[email] = attempts + 1;
  res.status(401).json({ message: "Incorrect security answer" });
};
