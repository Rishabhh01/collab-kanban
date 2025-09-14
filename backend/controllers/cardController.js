import { supabase } from '../supabaseClient.js';
import { broadcastUpdate } from '../websocket.js';
import { logCardActivity } from '../utils/activityLogger.js';

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

  // Log activity
  if (board_id && owner_id) {
    const userInfo = {
      name: req.user?.name || req.user?.email || 'Unknown User',
      email: req.user?.email || ''
    };
    
    await logCardActivity(
      board_id,
      owner_id,
      userInfo,
      'created',
      data[0],
      { columnId }
    );
  }

  broadcastUpdate({ 
    type: 'CARD_CREATED', 
    card: data[0],
    boardId: board_id,
    userId: owner_id
  });

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

// ---------------- UPDATE A CARD ----------------
export const updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignee_id, due_date, labels, priority, column_id } = req.body;
  const userId = req.user?.id;

  if (!id) {
    return res.status(400).json({ error: "Card ID is required" });
  }

  try {
    // Get current card data for activity logging
    const { data: currentCard, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Update card
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (labels !== undefined) updateData.labels = labels;
    if (priority !== undefined) updateData.priority = priority;
    if (column_id !== undefined) updateData.column_id = column_id;

    const { data, error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    // Get board ID for activity logging
    const { data: boardData, error: boardError } = await supabase
      .from('columns')
      .select('board_id')
      .eq('id', currentCard.column_id)
      .single();

    const board_id = boardData?.board_id || null;

    // Log activity
    if (board_id && userId) {
      const userInfo = {
        name: req.user?.name || req.user?.email || 'Unknown User',
        email: req.user?.email || ''
      };
      
      const action = column_id && column_id !== currentCard.column_id ? 'moved' : 'updated';
      
      await logCardActivity(
        board_id,
        userId,
        userInfo,
        action,
        data[0],
        { 
          previousColumnId: currentCard.column_id,
          newColumnId: column_id,
          changes: updateData
        }
      );
    }

    broadcastUpdate({ 
      type: 'CARD_UPDATED', 
      card: data[0],
      boardId: board_id,
      userId: userId
    });

    res.json(data[0]);
  } catch (err) {
    console.error('Error updating card:', err);
    res.status(500).json({ error: 'Server error while updating card' });
  }
};

// ---------------- DELETE A CARD ----------------
export const deleteCard = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!id) {
    return res.status(400).json({ error: "Card ID is required" });
  }

  try {
    // Get card data for activity logging
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Get board ID
    const { data: boardData, error: boardError } = await supabase
      .from('columns')
      .select('board_id')
      .eq('id', card.column_id)
      .single();

    const board_id = boardData?.board_id || null;

    // Delete card
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    // Log activity
    if (board_id && userId) {
      const userInfo = {
        name: req.user?.name || req.user?.email || 'Unknown User',
        email: req.user?.email || ''
      };
      
      await logCardActivity(
        board_id,
        userId,
        userInfo,
        'deleted',
        card,
        { columnId: card.column_id }
      );
    }

    broadcastUpdate({ 
      type: 'CARD_DELETED', 
      cardId: id,
      boardId: board_id,
      userId: userId
    });

    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Error deleting card:', err);
    res.status(500).json({ error: 'Server error while deleting card' });
  }
};