import { Request, Response } from "express";
import { User } from "../models/User";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find();
  res.status(200).json(users);
};

export const getSecurityQuestion = async (_req: Request, res: Response) => {
  const { email } = _req.query;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ securityQuestion: user.securityQuestion });
};

export const updateUserCategory = async (req: Request, res: Response) => {
  const { userId, category } = req.body;
  await User.findByIdAndUpdate(userId, { category });
  res.status(200).json({ message: "Category updated" });
};

export const promoteToAdmin = async (req: Request, res: Response) => {
  const { userId } = req.body;
  await User.findByIdAndUpdate(userId, { role: "admin" });
  res.status(200).json({ message: "User promoted to admin" });
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId, data } = req.body;
  await User.findByIdAndUpdate(userId, data);
  res.status(200).json({ message: "User updated" });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  await User.findByIdAndDelete(userId);
  res.status(200).json({ message: "User deleted" });
};
