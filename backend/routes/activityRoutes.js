import express from 'express';
import {
  getBoardActivities,
  getUserActivities,
  getActivityStats,
  getRecentActivities
} from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 🔐 Protect all activity routes
router.get('/board/:boardId', authMiddleware, getBoardActivities);
router.get('/user/:userId', authMiddleware, getUserActivities);
router.get('/board/:boardId/stats', authMiddleware, getActivityStats);
router.get('/recent', authMiddleware, getRecentActivities);

export default router;
