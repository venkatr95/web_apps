import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import channelRoutes from "./routes/channel.routes";
import recipeRoutes from "./routes/recipe.routes";

dotenv.config();

const app = express();
// Allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // allow cookies if needed
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/recipes", recipeRoutes);

mongoose.connect(process.env.MONGO_URI!).then(() => {
  console.log("MongoDB connected");
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});
