// Activity Service for activity feed management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get board activities
export const getBoardActivities = async (boardId, limit = 50, offset = 0) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/board/${boardId}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get board activities');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting board activities:', error);
    return { activities: [], total: 0 };
  }
};

// Get recent activities for dashboard
export const getRecentActivities = async (limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/recent?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get recent activities');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return { activities: [] };
  }
};

// Get activity statistics
export const getActivityStats = async (boardId, days = 7) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/board/${boardId}/stats?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get activity stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting activity stats:', error);
    return null;
  }
};
