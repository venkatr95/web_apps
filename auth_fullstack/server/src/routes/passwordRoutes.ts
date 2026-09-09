import express from 'express';
import {
  resetPassword,
  forgotPassword,
  verifySecurityAnswer
} from '../controllers/passwordController';

const router = express.Router();

router.post('/reset', resetPassword);
router.post('/forgot', forgotPassword);
router.post('/verify-answer', verifySecurityAnswer);

export default router;