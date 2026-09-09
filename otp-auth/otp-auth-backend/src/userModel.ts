import mongoose, { Document, Schema } from 'mongoose';

// Define a User interface that extends Mongoose's Document
interface IUser extends Document {
  email: string;
  otp?: string;
  otpExpiry?: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: false }, // OTP is optional
  otpExpiry: { type: Date, required: false }, // OTP expiry date is optional
});

const User = mongoose.model<IUser>('User', userSchema);

export { IUser, User };
