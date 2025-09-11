import express from 'express';
import { getOrCreateUser, userOnline, userOffline } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', getOrCreateUser);
router.post('/online', authMiddleware, userOnline);
router.post('/offline', authMiddleware, userOffline);

export default router;
