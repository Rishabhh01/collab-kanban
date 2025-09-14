// websocket.js
import { WebSocketServer } from 'ws';
import presenceManager from './utils/presenceManager.js';

let wss;

export const createWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('A user connected');
    
    // Store user session info on the WebSocket connection
    ws.userSession = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'JOIN_BOARD':
            handleJoinBoard(ws, data);
            break;
          case 'LEAVE_BOARD':
            handleLeaveBoard(ws, data);
            break;
          case 'USER_ACTIVITY':
            handleUserActivity(ws, data);
            break;
          case 'CARD_UPDATE':
          case 'COLUMN_UPDATE':
          case 'BOARD_UPDATE':
            // Broadcast to all clients in the same board
            broadcastToBoard(data.boardId, data);
            break;
          default:
            // Default broadcast to all clients
            broadcastToAll(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        // Fallback to simple broadcast
        broadcastToAll(message.toString());
      }
    });

    ws.on('close', () => {
      console.log('A user disconnected');
      // Clean up user presence when they disconnect
      if (ws.userSession) {
        presenceManager.removeUserFromBoard(
          ws.userSession.userId, 
          ws.userSession.boardId
        );
        
        // Broadcast user left
        broadcastToBoard(ws.userSession.boardId, {
          type: 'USER_LEFT_BOARD',
          boardId: ws.userSession.boardId,
          userId: ws.userSession.userId,
          onlineUsers: presenceManager.getOnlineUsersForBoard(ws.userSession.boardId)
        });
      }
    });
  });

  console.log('WebSocket server running');
};

// Handle user joining a board
const handleJoinBoard = (ws, data) => {
  const { userId, boardId, userInfo } = data;
  
  if (!userId || !boardId) {
    ws.send(JSON.stringify({ 
      type: 'ERROR', 
      message: 'User ID and Board ID are required' 
    }));
    return;
  }

  // Store session info
  ws.userSession = { userId, boardId, userInfo };
  
  // Add user to presence manager
  const onlineUsers = presenceManager.addUserToBoard(userId, boardId, userInfo);
  
  // Send confirmation to user
  ws.send(JSON.stringify({
    type: 'JOINED_BOARD',
    boardId,
    onlineUsers,
    user: { id: userId, ...userInfo }
  }));
  
  // Broadcast to other users in the board
  broadcastToBoard(boardId, {
    type: 'USER_JOINED_BOARD',
    boardId,
    user: { id: userId, ...userInfo },
    onlineUsers
  }, ws); // Exclude the joining user
};

// Handle user leaving a board
const handleLeaveBoard = (ws, data) => {
  const { userId, boardId } = data;
  
  if (ws.userSession) {
    const onlineUsers = presenceManager.removeUserFromBoard(userId, boardId);
    
    // Broadcast to other users in the board
    broadcastToBoard(boardId, {
      type: 'USER_LEFT_BOARD',
      boardId,
      userId,
      onlineUsers
    });
    
    // Clear session
    ws.userSession = null;
  }
};

// Handle user activity (typing, viewing, etc.)
const handleUserActivity = (ws, data) => {
  const { userId, boardId, activity } = data;
  
  if (ws.userSession && ws.userSession.userId === userId) {
    presenceManager.updateUserActivity(userId);
    
    // Broadcast activity to other users in the board
    broadcastToBoard(boardId, {
      type: 'USER_ACTIVITY',
      boardId,
      userId,
      activity,
      timestamp: new Date().toISOString()
    }, ws); // Exclude the user who performed the activity
  }
};

// Broadcast to all clients in a specific board
const broadcastToBoard = (boardId, data, excludeWs = null) => {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN && 
        client !== excludeWs && 
        client.userSession && 
        client.userSession.boardId === boardId) {
      client.send(JSON.stringify(data));
    }
  });
};

// Broadcast to all clients
const broadcastToAll = (data) => {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Send data from server to all clients
export const broadcastUpdate = (data) => {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};
