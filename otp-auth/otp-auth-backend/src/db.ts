import mongoose from "mongoose";

const options = {
    autoIndex: false,
    connectTimeoutMS: 0,
    socketTimeoutMS: 0,
    family: 4
}

const mongodb_url = process.env.MONGODB_URI || 'mongodb://localhost:27017/otp_auth';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongodb_url, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;