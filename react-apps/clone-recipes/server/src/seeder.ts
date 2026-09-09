import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model";
import Channel from "./models/channel.model";
import Recipe from "./models/recipe.model";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to DB");

    // Clear existing data
    await User.deleteMany();
    await Channel.deleteMany();
    await Recipe.deleteMany();

    const password = await bcrypt.hash("password123", 10);

    // Create users
    const admin = await User.create({
      username: "admin1",
      password,
      role: "admin",
    });
    const creator = await User.create({
      username: "chefTom",
      password,
      role: "creator",
    });
    const user = await User.create({
      username: "foodieJane",
      password,
      role: "user",
    });

    // Create channels
    const channel1 = await Channel.create({
      name: "QuickMeals",
      tag: "fast",
      createdBy: creator._id,
    });
    const channel2 = await Channel.create({
      name: "VeganDelights",
      tag: "vegan",
      createdBy: creator._id,
    });

    // Create recipes
    await Recipe.create([
      {
        title: "10-Minute Pasta",
        content: "Boil pasta, add sauce, done!",
        tag: "pasta",
        channel: channel1._id,
        createdBy: creator._id,
      },
      {
        title: "Vegan Tofu Bowl",
        content: "Tofu + rice + veggies = power!",
        tag: "tofu",
        channel: channel2._id,
        createdBy: creator._id,
      },
    ]);

    console.log("Seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
