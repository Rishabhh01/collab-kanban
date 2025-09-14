import express from 'express';
import { createColumn, getColumns, deleteColumn } from '../controllers/columnController.js';
import { authMiddleware } from '../middleware/auth.js'; // 🔐 import auth guard

const router = express.Router({ mergeParams: true }); // allow parent route params

// POST /api/boards/:boardId/columns
router.post('/:boardId/columns', authMiddleware, createColumn);

// GET /api/boards/:boardId/columns
router.get('/:boardId/columns', authMiddleware, getColumns);

// DELETE /api/boards/columns/:columnId
router.delete('/columns/:columnId', authMiddleware, deleteColumn);

export default router;