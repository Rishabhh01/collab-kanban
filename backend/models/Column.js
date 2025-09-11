const express = require('express');
const router = express.Router();
const { getColumns, createColumn, updateColumn, deleteColumn } = require('../controllers/columnController');

router.get('/', getColumns);
router.post('/', createColumn);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);

module.exports = router;

