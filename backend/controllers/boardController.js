import { supabase } from '../supabaseClient.js';
import { broadcastUpdate } from '../websocket.js';
import presenceManager from '../utils/presenceManager.js';

// Helper function to get online users for a board
const getOnlineUsersForBoard = (boardId) => {
  return presenceManager.getOnlineUsersForBoard(boardId);
};

// ------------------- CREATE A BOARD -------------------
export const createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const owner_id = req.user?.id || null;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    console.log("Creating board with:", { title, owner_id });
    console.log("Full user object:", req.user);
  
  // Check if user exists in database
  let validOwnerId = null;
  if (owner_id) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', owner_id)
      .single();
    
    console.log("User lookup result:", { user, userError });
    
    if (userError || !user) {
      console.log("User not found, creating board without owner");
      validOwnerId = null;
    } else {
      console.log("User found, using owner_id:", user.id);
      validOwnerId = user.id;
    }
  }

  // Create board with valid owner_id (or without if user doesn't exist)
  const boardData = { title };
  if (validOwnerId) {
    boardData.owner_id = validOwnerId;
  }

  console.log("Creating board with data:", boardData);

  const { data, error } = await supabase
    .from('boards')
    .insert([boardData])
    .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    broadcastUpdate({ type: 'BOARD_CREATED', board: data[0] });
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Unexpected error in createBoard:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
      .eq('board_id', boardId)
      .order('order', { ascending: true });

    if (columnError) {
      return res.status(400).json({ error: columnError.message });
    }

    // Fetch cards for these columns
    const columnIds = columns.map((col) => col.id);
    let cards = [];
    if (columnIds.length > 0) {
      const { data: cardsData, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .in('column_id', columnIds);

      if (cardError) {
        return res.status(400).json({ error: cardError.message });
      }
      cards = cardsData || [];
    }

    // Get online users for this board (from Redis or in-memory store)
    const onlineUsers = await getOnlineUsersForBoard(boardId);

    // Calculate statistics
    const totalCards = cards.length;
    const totalColumns = columns.length;
    const lastUpdated = new Date().toISOString();

    // Add statistics to board object
    const boardWithStats = {
      ...board,
      statistics: {
        totalColumns,
        totalCards,
        lastUpdated,
        onlineUsers: onlineUsers.length
      },
      onlineUsers: onlineUsers
    };

    // Attach cards to their respective columns
    const columnsWithCards = columns.map(column => ({
      ...column,
      cards: cards.filter(card => card.column_id === column.id)
    }));

    res.json({
      board: boardWithStats,
      columns: columnsWithCards,
    });
  } catch (err) {
    console.error("Error fetching board details:", err.message);
    res.status(500).json({ error: 'Server error while fetching board details' });
  }
};

// ------------------- JOIN BOARD (USER PRESENCE) -------------------
export const joinBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.id;
    const userInfo = {
      name: req.user?.name || req.user?.email || 'Anonymous User',
      email: req.user?.email || ''
    };

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    // Verify board exists
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .single();

    if (boardError || !board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Add user to board
    const onlineUsers = presenceManager.addUserToBoard(userId, boardId, userInfo);

    // Broadcast user joined
    broadcastUpdate({ 
      type: 'USER_JOINED_BOARD', 
      boardId, 
      user: { id: userId, ...userInfo },
      onlineUsers 
    });

    res.json({ 
      message: 'Joined board successfully',
      onlineUsers,
      user: { id: userId, ...userInfo }
    });
  } catch (err) {
    console.error("Error joining board:", err.message);
    res.status(500).json({ error: 'Server error while joining board' });
  }
};

// ------------------- LEAVE BOARD (USER PRESENCE) -------------------
export const leaveBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    // Remove user from board
    const onlineUsers = presenceManager.removeUserFromBoard(userId, boardId);

    // Broadcast user left
    broadcastUpdate({ 
      type: 'USER_LEFT_BOARD', 
      boardId, 
      userId,
      onlineUsers 
    });

    res.json({ 
      message: 'Left board successfully',
      onlineUsers
    });
  } catch (err) {
    console.error("Error leaving board:", err.message);
    res.status(500).json({ error: 'Server error while leaving board' });
  }
};

// ------------------- GET ONLINE USERS FOR BOARD -------------------
export const getOnlineUsers = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const onlineUsers = presenceManager.getOnlineUsersForBoard(boardId);

    res.json({ onlineUsers });
  } catch (err) {
    console.error("Error getting online users:", err.message);
    res.status(500).json({ error: 'Server error while getting online users' });
  }
};