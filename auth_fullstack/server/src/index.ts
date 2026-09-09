import express from "express";
import connectDB from "../config/db";
import authRoutes from "./routes/authRoutes";
import loginRoutes from "./routes/loginRoutes";
import userRoutes from "./routes/userRoutes";
import passwordRoutes from "./routes/passwordRoutes";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // process.env.FRONTEND_URL
  })
);

app.use(bodyParser.json());
app.options("*", cors());

app.use("/api/auth", authRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/users", userRoutes);
app.use("/api/password", passwordRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (request, response) => {
  ///server to client
  response.json({
    message: "Server is running " + PORT,
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
});
