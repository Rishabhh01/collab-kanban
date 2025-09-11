import express from 'express';
import { createCard, getCards } from '../controllers/cardController.js';
import { authMiddleware } from '../middleware/auth.js'; // 🔐 import auth guard

const router = express.Router({ mergeParams: true });

// POST /api/columns/:columnId/cards
router.post('/:columnId/cards', authMiddleware, createCard);

// GET /api/columns/:columnId/cards
router.get('/:columnId/cards', authMiddleware, getCards);

export default router;