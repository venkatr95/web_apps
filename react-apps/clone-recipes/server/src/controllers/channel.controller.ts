import { Request, Response } from "express";
import Channel from "../models/channel.model";

export const createChannel = async (req: any, res: Response) => {
  const { name, tag } = req.body;

  try {
    const existing = await Channel.findOne({ name });
    if (existing)
      return res.status(400).json({ msg: "Channel name already exists" });

    const newChannel = new Channel({
      name,
      tag,
      createdBy: req.user.id,
    });

    await newChannel.save();
    res.status(201).json(newChannel);
  } catch (error) {
    res.status(500).json({ msg: "Failed to create channel", error });
  }
};

export const getAllChannels = async (_req: Request, res: Response) => {
  const channels = await Channel.find().populate("createdBy", "username");
  res.json(channels);
};
