import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  tag: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Channel", channelSchema);
