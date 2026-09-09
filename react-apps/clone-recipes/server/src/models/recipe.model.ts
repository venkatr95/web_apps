import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: String,
  content: String,
  tag: String,
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Recipe", recipeSchema);
