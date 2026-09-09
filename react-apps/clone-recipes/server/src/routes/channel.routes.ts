import express from "express";
import {
  createChannel,
  getAllChannels,
} from "../controllers/channel.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = express.Router();

router.get("/", getAllChannels);
router.post(
  "/",
  authenticate,
  authorizeRoles("creator", "admin"),
  createChannel
);

export default router;
