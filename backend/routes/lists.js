const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Get lists for a board
router.get('/:boardId', authMiddleware, async (req, res) => {
  const { boardId } = req.params;

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('board_id', boardId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create a new list in a board
router.post('/', authMiddleware, async (req, res) => {
  const { title, board_id } = req.body;

  const { data, error } = await supabase
    .from('lists')
    .insert([{ title, board_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;
