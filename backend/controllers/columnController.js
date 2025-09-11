// columnController.js
import { broadcastUpdate } from '../websocket.js';
import { supabase } from '../supabaseClient.js'; 
// import { logAudit } from '../utils/auditLogger.js'; // Uncomment if audit logging is used

// ---------------- CREATE A COLUMN ----------------
export const createColumn = async (req, res) => {
  const { title, order } = req.body;
  const { boardId } = req.params;  // <-- Get boardId from URL
  const owner_id = req.user?.id || null; // Safe fallback

  if (!title || !boardId) {
    return res.status(400).json({ error: 'Title and boardId are required' });
  }

  const { data, error } = await supabase
    .from('columns')
    .insert([{ title, board_id: boardId, order }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  // Optional audit logging
  // if (data && data.length > 0) {
  //   await logAudit({
  //     board_id: boardId,
  //     event_type: 'ColumnCreated',
  //     user_id: owner_id,
  //   });
  // }

  // Broadcast new column to WebSocket subscribers
  broadcastUpdate({ type: 'COLUMN_CREATED', column: data[0] });

  res.status(201).json(data[0]);
};

// ---------------- GET ALL COLUMNS FOR A BOARD ----------------
export const getColumns = async (req, res) => {
  const { boardId } = req.params;

  if (!boardId) {
    return res.status(400).json({ error: 'boardId is required' });
  }

  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('order', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data); // Return all columns for this board
  } catch (err) {
    console.error('Error fetching columns:', err.message);
    res.status(500).json({ error: 'Server error while fetching columns' });
  }
};
