import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Replace with your backend URL

export const requestOtp = async (email: string) => {
  const response = await axios.post(`${API_URL}/request-otp`, { email });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return response.data;
};
