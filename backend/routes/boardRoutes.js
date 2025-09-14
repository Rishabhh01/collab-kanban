import express from 'express';
import {
  createBoard,
  getBoards,
  deleteBoard,
  getBoardDetails,
  joinBoard,
  leaveBoard,
  getOnlineUsers,
} from '../controllers/boardController.js';
import { authMiddleware } from '../middleware/auth.js'; // 👈 import auth guard

const router = express.Router();

// 🔐 Protect all board routes
router.post('/', authMiddleware, createBoard);
router.get('/', authMiddleware, getBoards);
router.get('/:id/details', authMiddleware, getBoardDetails);
router.delete('/:id', authMiddleware, deleteBoard);

// User presence routes
router.post('/:boardId/join', authMiddleware, joinBoard);
router.post('/:boardId/leave', authMiddleware, leaveBoard);
router.get('/:boardId/online-users', authMiddleware, getOnlineUsers);

export default router;