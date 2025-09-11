const { DataTypes } = require('sequelize');
const express = require('express');
const router = express.Router();
const { getCards, createCard, updateCard, deleteCard } = require('../controllers/cardController');

router.get('/', getCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;

