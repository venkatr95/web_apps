import { Request, Response } from 'express';
import { User } from '../models/User';
import { hashValue } from '../utils/helpers';

export const loginUser = async (req: Request, res: Response) => {
  const { identifier, passwordOrPin, method } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashed = hashValue(passwordOrPin);
  if ((method === 'password' && hashed === user.password) || 
      (method === 'pin' && hashed === user.pin)) {
    return res.status(200).json({ message: 'Login successful', user });
  }

  res.status(401).json({ message: 'Invalid credentials' });
};