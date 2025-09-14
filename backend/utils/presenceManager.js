// Presence Manager for tracking online users
// Using in-memory storage (can be replaced with Redis later)

class PresenceManager {
  constructor() {
    // Store: { boardId: Set of userIds }
    this.boardUsers = new Map();
    // Store: { userId: { boardId, lastSeen, userInfo } }
    this.userSessions = new Map();
  }

  // Add user to a board
  addUserToBoard(userId, boardId, userInfo = {}) {
    if (!this.boardUsers.has(boardId)) {
      this.boardUsers.set(boardId, new Set());
    }
    
    this.boardUsers.get(boardId).add(userId);
    
    this.userSessions.set(userId, {
      boardId,
      lastSeen: new Date(),
      userInfo: {
        name: userInfo.name || `User ${userId.slice(0, 8)}`,
        email: userInfo.email || '',
        ...userInfo
      }
    });

    console.log(`User ${userId} joined board ${boardId}`);
    return this.getOnlineUsersForBoard(boardId);
  }

  // Remove user from a board
  removeUserFromBoard(userId, boardId) {
    if (this.boardUsers.has(boardId)) {
      this.boardUsers.get(boardId).delete(userId);
    }
    
    this.userSessions.delete(userId);
    
    console.log(`User ${userId} left board ${boardId}`);
    return this.getOnlineUsersForBoard(boardId);
  }

  // Update user's last seen timestamp
  updateUserActivity(userId) {
    const session = this.userSessions.get(userId);
    if (session) {
      session.lastSeen = new Date();
    }
  }

  // Get online users for a specific board
  getOnlineUsersForBoard(boardId) {
    if (!this.boardUsers.has(boardId)) {
      return [];
    }

    const userIds = Array.from(this.boardUsers.get(boardId));
    const onlineUsers = userIds
      .map(userId => {
        const session = this.userSessions.get(userId);
        if (session && session.boardId === boardId) {
          return {
            id: userId,
            name: session.userInfo.name,
            email: session.userInfo.email,
            lastSeen: session.lastSeen
          };
        }
        return null;
      })
      .filter(user => user !== null);

    return onlineUsers;
  }

  // Get all online users across all boards
  getAllOnlineUsers() {
    const allUsers = [];
    for (const [userId, session] of this.userSessions) {
      allUsers.push({
        id: userId,
        boardId: session.boardId,
        name: session.userInfo.name,
        email: session.userInfo.email,
        lastSeen: session.lastSeen
      });
    }
    return allUsers;
  }

  // Clean up inactive users (older than 5 minutes)
  cleanupInactiveUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const inactiveUsers = [];

    for (const [userId, session] of this.userSessions) {
      if (session.lastSeen < fiveMinutesAgo) {
        inactiveUsers.push({ userId, boardId: session.boardId });
      }
    }

    // Remove inactive users
    inactiveUsers.forEach(({ userId, boardId }) => {
      this.removeUserFromBoard(userId, boardId);
    });

    return inactiveUsers.length;
  }

  // Get user session info
  getUserSession(userId) {
    return this.userSessions.get(userId);
  }
}

// Create singleton instance
const presenceManager = new PresenceManager();

// Cleanup inactive users every 2 minutes
setInterval(() => {
  const cleaned = presenceManager.cleanupInactiveUsers();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} inactive users`);
  }
}, 2 * 60 * 1000);

export default presenceManager;
