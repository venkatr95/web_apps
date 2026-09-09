import express from "express";
import {
  createRecipe,
  getRecipesByChannel,
  likeRecipe,
  heartRecipe,
} from "../controllers/recipe.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = express.Router();

router.get("/channel/:channelId", authenticate, getRecipesByChannel);
router.post(
  "/",
  authenticate,
  authorizeRoles("creator", "admin"),
  createRecipe
);
router.post("/:id/like", authenticate, likeRecipe);
router.post("/:id/heart", authenticate, heartRecipe);

export default router;
