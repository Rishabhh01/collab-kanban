import { supabase } from '../supabaseClient.js';
import { broadcastUpdate } from '../websocket.js';
// import { logAudit } from '../utils/auditLogger.js'; // Uncomment if audit logging is used

// ---------------- CREATE A CARD ----------------
export const createCard = async (req, res) => {
  const { title, description, assignee_id, due_date, labels } = req.body;
  const { columnId } = req.params;
  const owner_id = req.user?.id || null;

  if (!title || !columnId) {
    return res.status(400).json({ error: "Title and columnId are required" });
  }

  const { data, error } = await supabase
    .from('cards')
    .insert([{
      title,
      description,
      column_id: columnId,
      assignee_id,
      due_date,
      labels,
      owner_id,
    }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  const { data: boardData, error: boardError } = await supabase
    .from('columns')
    .select('board_id')
    .eq('id', columnId)
    .single();

  const board_id = boardData?.board_id || null;

  // Optional audit logging
  // if (board_id) {
  //   await logAudit({
  //     board_id,
  //     event_type: 'CardCreated',
  //     user_id: owner_id,
  //   });
  // }

  broadcastUpdate({ type: 'CARD_CREATED', card: data[0] });

  res.status(201).json(data[0]);
};



// ---------------- GET CARDS BY COLUMN ----------------
export const getCards = async (req, res) => {
  const { columnId } = req.params;

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('column_id', columnId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};