// Presence Service for user presence management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Join a board (user presence)
export const joinBoard = async (boardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to join board');
    }

    return await response.json();
  } catch (error) {
    console.error('Error joining board:', error);
    throw error;
  }
};

// Leave a board (user presence)
export const leaveBoard = async (boardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to leave board');
    }

    return await response.json();
  } catch (error) {
    console.error('Error leaving board:', error);
    throw error;
  }
};

// Get online users for a board
export const getOnlineUsers = async (boardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/online-users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get online users');
    }

    const data = await response.json();
    return data.onlineUsers || [];
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
};
