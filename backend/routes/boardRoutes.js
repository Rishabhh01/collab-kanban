import express from 'express';
import {
  createBoard,
  getBoards,
  deleteBoard,
  getBoardDetails,
} from '../controllers/boardController.js';
import { authMiddleware } from '../middleware/auth.js'; // 👈 import auth guard

const router = express.Router();

// 🔐 Protect all board routes
router.post('/', authMiddleware, createBoard);
router.get('/', authMiddleware, getBoards);
router.get('/:id/details', authMiddleware, getBoardDetails);
router.delete('/:id', authMiddleware, deleteBoard);

export default router;