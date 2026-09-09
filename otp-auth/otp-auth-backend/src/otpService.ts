import { User } from './userModel';
import redisClient from './cache';

// Function to generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to store OTP in both MongoDB and Redis
export const storeOTP = async (email: string, otp: string): Promise<void> => {
  // Store OTP in Redis with a 15-minute expiry (for caching)
  await redisClient.set(`otp:${email}`, otp, { EX: 15 * 60 });

  // Store OTP in MongoDB with expiry
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  await User.findOneAndUpdate(
    { email },
    { otp, otpExpiry },
    { upsert: true, new: true }
  );
};

// Function to verify OTP from Redis or MongoDB
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  // Check Redis cache first
  const cachedOtp = await redisClient.get(`otp:${email}`);
  if (cachedOtp === otp) {
    return true;
  }

  // If OTP is not in Redis, check in MongoDB
  const user = await User.findOne({ email });
  if (user && user.otp === otp && user.otpExpiry && new Date() < user.otpExpiry) {
    return true;
  }

  return false;
};

// Function to remove OTP from both MongoDB and Redis after successful verification
export const removeOTP = async (email: string): Promise<void> => {
  await redisClient.del(`otp:${email}`);
  await User.findOneAndUpdate(
    { email },
    { $unset: { otp: "", otpExpiry: "" } }
  );
};
