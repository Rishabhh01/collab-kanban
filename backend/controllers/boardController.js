import { supabase } from '../supabaseClient.js';
import { broadcastUpdate } from '../websocket.js';

// ------------------- CREATE A BOARD -------------------
export const createBoard = async (req, res) => {
  const { title } = req.body;
  const owner_id = req.user?.id || null;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  console.log("Creating board with:", { title, owner_id });

  const { data, error } = await supabase
    .from('boards')
    .insert([{ title, owner_id }])
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(400).json({ error: error.message });
  }

  broadcastUpdate({ type: 'BOARD_CREATED', board: data[0] });
  res.status(201).json(data[0]);
};

// ------------------- GET ALL BOARDS -------------------
export const getBoards = async (req, res) => {
  try {
    const { data, error } = await supabase.from('boards').select('*');
    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    console.error('Error fetching boards:', err.message);
    res.status(500).json({ error: 'Server error while fetching boards' });
  }
};

// ------------------- DELETE A BOARD -------------------
export const deleteBoard = async (req, res) => {
  const boardId = req.params.id;

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);

  if (error) {
    console.error("Supabase delete error:", error);
    return res.status(400).json({ error: error.message });
  }

  broadcastUpdate({ type: 'BOARD_DELETED', boardId });
  res.status(200).json({ message: 'Board deleted successfully' });
};

// ------------------- GET BOARD DETAILS -------------------
export const getBoardDetails = async (req, res) => {
  const boardId = req.params.id;

  try {
    // Fetch board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (boardError || !board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Fetch columns for this board
    const { data: columns, error: columnError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId);

    if (columnError) {
      return res.status(400).json({ error: columnError.message });
    }

    // Fetch cards for these columns
    const columnIds = columns.map((col) => col.id);
    const { data: cards, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .in('column_id', columnIds);

    if (cardError) {
      return res.status(400).json({ error: cardError.message });
    }

    res.json({
      board,
      columns,
      cards,
    });
  } catch (err) {
    console.error("Error fetching board details:", err.message);
    res.status(500).json({ error: 'Server error while fetching board details' });
  }
};