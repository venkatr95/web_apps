import axios from "axios";
import { FormData } from "../types/FormData";

const API_BASE_URL = "http://localhost:8000";

export const fetchUUIDs = async (): Promise<string[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/uuids`);
  return response.data;
};

export const fetchFormData = async (uuid: string): Promise<FormData> => {
  const response = await axios.post(`${API_BASE_URL}/api/get-form-data`, {
    uuid,
  });
  return response.data;
};
