import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  phone: string;
  password: string;
  pin: string;
  role: 'user' | 'admin';
  category: 'Basic' | 'Silver' | 'Gold';
  securityQuestion: string;
  securityAnswer: string;
}

const userSchema = new mongoose.Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pin: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  category: { type: String, enum: ['Basic', 'Silver', 'Gold'], default: 'Basic' },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model<UserDocument>('User', userSchema);