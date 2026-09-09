import { connect, disconnect } from "mongoose";

const MONGODB_URL: string = process.env.MONGODB_URL || "";

async function connectToDatabase() {
  try {
    await connect(MONGODB_URL);
  } catch (error) {
    console.log(error);
    throw new Error("Could not Connect To MongoDB");
  }
}

async function disconnectFromDatabase() {
  try {
    await disconnect();
  } catch (error) {
    console.log(error);
    throw new Error("Could not Disconnect From MongoDB");
  }
}

export { connectToDatabase, disconnectFromDatabase };
