import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { generateToken, hashValue, base64Encode, verifyTimeHash } from '../utils/helpers';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, phone, pin, password, confirmPassword, securityQuestion, securityAnswer } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = hashValue(password);
    const hashedPin = hashValue(pin);
    const encodedAnswer = base64Encode(securityAnswer);

    const newUser = new User({
      email,
      phone,
      pin: hashedPin,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: encodedAnswer,
      role: 'user',
      category: 'Basic',
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};