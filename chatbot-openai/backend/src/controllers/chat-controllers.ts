import { NextFunction, Request, Response } from "express";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { configureOpenAI } from "../config/openai-config";
import User from "../models/User";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    }

    // Build chat history for OpenAI
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];
    chats.push({ role: "user", content: message });
    user.chats.push({ role: "user", content: message });

    // Setup OpenAI
    const openai = new OpenAIApi(configureOpenAI());

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-4.1-nano",
      messages: chats,
    });

    const aiMessage = response.data.choices[0]?.message;

    // Guard clause for undefined AI response
    if (!aiMessage || !aiMessage.content || !aiMessage.role) {
      return res
        .status(500)
        .json({ message: "AI response was invalid or incomplete." });
    }

    user.chats.push({
      role: aiMessage.role,
      content: aiMessage.content,
    });

    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.error("generateChatCompletion error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error: any) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
