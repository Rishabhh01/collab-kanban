// Activity Logger for tracking board activities
import { supabase } from '../supabaseClient.js';

class ActivityLogger {
  constructor() {
    // In-memory cache for recent activities (last 100 per board)
    this.activityCache = new Map();
  }

  // Log an activity
  async logActivity(activityData) {
    try {
      const {
        boardId,
        userId,
        userName,
        userEmail,
        action,
        targetType, // 'card', 'column', 'board'
        targetId,
        targetTitle,
        details = {},
        metadata = {}
      } = activityData;

      const activity = {
        board_id: boardId,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        action,
        target_type: targetType,
        target_id: targetId,
        target_title: targetTitle,
        details: JSON.stringify(details),
        metadata: JSON.stringify(metadata),
        timestamp: new Date().toISOString()
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([activity])
        .select();

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      // Add to cache
      this.addToCache(boardId, data[0]);

      return data[0];
    } catch (error) {
      console.error('Error in logActivity:', error);
      return null;
    }
  }

  // Add activity to cache
  addToCache(boardId, activity) {
    if (!this.activityCache.has(boardId)) {
      this.activityCache.set(boardId, []);
    }

    const activities = this.activityCache.get(boardId);
    activities.unshift(activity); // Add to beginning

    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100);
    }

    this.activityCache.set(boardId, activities);
  }

  // Get recent activities for a board
  async getBoardActivities(boardId, limit = 50) {
    try {
      // First check cache
      if (this.activityCache.has(boardId)) {
        const cachedActivities = this.activityCache.get(boardId);
        if (cachedActivities.length >= limit) {
          return cachedActivities.slice(0, limit);
        }
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('board_id', boardId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      // Update cache
      if (data && data.length > 0) {
        this.activityCache.set(boardId, data);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBoardActivities:', error);
      return [];
    }
  }

  // Get user activities
  async getUserActivities(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserActivities:', error);
      return [];
    }
  }

  // Clear cache for a board
  clearBoardCache(boardId) {
    this.activityCache.delete(boardId);
  }

  // Get activity statistics
  async getActivityStats(boardId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('action, target_type, timestamp')
        .eq('board_id', boardId)
        .gte('timestamp', startDate.toISOString());

      if (error) {
        console.error('Error fetching activity stats:', error);
        return null;
      }

      // Process statistics
      const stats = {
        totalActivities: data.length,
        actionsByType: {},
        activitiesByDay: {},
        mostActiveUsers: {}
      };

      data.forEach(activity => {
        // Count by action type
        stats.actionsByType[activity.action] = (stats.actionsByType[activity.action] || 0) + 1;
        
        // Count by day
        const day = activity.timestamp.split('T')[0];
        stats.activitiesByDay[day] = (stats.activitiesByDay[day] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error in getActivityStats:', error);
      return null;
    }
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

// Helper functions for common activities
export const logCardActivity = async (boardId, userId, userInfo, action, cardData, details = {}) => {
  return await activityLogger.logActivity({
    boardId,
    userId,
    userName: userInfo.name || userInfo.email || 'Unknown User',
    userEmail: userInfo.email || '',
    action,
    targetType: 'card',
    targetId: cardData.id,
    targetTitle: cardData.title,
    details: {
      cardId: cardData.id,
      cardTitle: cardData.title,
      columnId: cardData.column_id,
      ...details
    }
  });
};

export const logColumnActivity = async (boardId, userId, userInfo, action, columnData, details = {}) => {
  return await activityLogger.logActivity({
    boardId,
    userId,
    userName: userInfo.name || userInfo.email || 'Unknown User',
    userEmail: userInfo.email || '',
    action,
    targetType: 'column',
    targetId: columnData.id,
    targetTitle: columnData.title,
    details: {
      columnId: columnData.id,
      columnTitle: columnData.title,
      ...details
    }
  });
};

export const logBoardActivity = async (boardId, userId, userInfo, action, boardData, details = {}) => {
  return await activityLogger.logActivity({
    boardId,
    userId,
    userName: userInfo.name || userInfo.email || 'Unknown User',
    userEmail: userInfo.email || '',
    action,
    targetType: 'board',
    targetId: boardData.id,
    targetTitle: boardData.title,
    details: {
      boardId: boardData.id,
      boardTitle: boardData.title,
      ...details
    }
  });
};

export default activityLogger;
