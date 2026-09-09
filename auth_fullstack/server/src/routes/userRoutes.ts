import express from "express";
import {
  getAllUsers,
  updateUserCategory,
  promoteToAdmin,
  updateUser,
  deleteUser,
  getSecurityQuestion,
} from "../controllers/adminController";
import { requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAdmin, getAllUsers);
router.get("/security-question", getSecurityQuestion);
router.put("/category", requireAdmin, updateUserCategory);
router.put("/promote", requireAdmin, promoteToAdmin);
router.put("/update", requireAdmin, updateUser);
router.delete("/:userId", requireAdmin, deleteUser);

export default router;
