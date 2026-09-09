import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role });
  await user.save();
  res.json({ message: "User registered" });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !user.password) {
    return res.status(401).json({ msg: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ msg: "Invalid credentials" });
  }

  const token = generateToken({ id: user._id, role: user.role });
  res.json({ token });
};
