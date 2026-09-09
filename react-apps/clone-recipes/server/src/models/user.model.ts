import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "creator", "user"], default: "user" },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});

export default mongoose.model("User", userSchema);
