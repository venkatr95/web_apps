import { Request, Response } from "express";
import Recipe from "../models/recipe.model";

export const createRecipe = async (req: any, res: Response) => {
  const { title, content, tag, channelId } = req.body;

  try {
    const newRecipe = new Recipe({
      title,
      content,
      tag,
      channel: channelId,
      createdBy: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ msg: "Failed to create recipe", error });
  }
};

export const getRecipesByChannel = async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find({ channel: req.params.channelId })
      .populate("createdBy", "username")
      .populate("channel", "name");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch recipes", error });
  }
};

export const likeRecipe = async (req: any, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

  if (!recipe.likes.includes(req.user.id)) {
    recipe.likes.push(req.user.id);
    await recipe.save();
  }

  res.json({ msg: "Liked", likes: recipe.likes.length });
};

export const heartRecipe = async (req: any, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

  if (!recipe.hearts.includes(req.user.id)) {
    recipe.hearts.push(req.user.id);
    await recipe.save();
  }

  res.json({ msg: "Hearted", hearts: recipe.hearts.length });
};
