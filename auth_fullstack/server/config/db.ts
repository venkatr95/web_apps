import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI: string | undefined = process.env.MONGODB_URI;

if (!mongoURI) {
  throw new Error("Please provide MONGODB_URI in the .env file");
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
