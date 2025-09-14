// Notification Manager for real-time notifications
import { supabase } from '../supabaseClient.js';
import { broadcastUpdate } from '../websocket.js';

class NotificationManager {
  constructor() {
    // In-memory cache for unread notifications
    this.notificationCache = new Map();
  }

  // Create a notification
  async createNotification(notificationData) {
    try {
      const {
        userId,
        boardId,
        type,
        title,
        message,
        data = {},
        priority = 'normal' // 'low', 'normal', 'high', 'urgent'
      } = notificationData;

      const notification = {
        user_id: userId,
        board_id: boardId,
        type,
        title,
        message,
        data: JSON.stringify(data),
        priority,
        is_read: false,
        created_at: new Date().toISOString()
      };

      // Insert into Supabase
      const { data: result, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      // Add to cache
      this.addToCache(userId, result[0]);

      // Broadcast real-time notification
      broadcastUpdate({
        type: 'NOTIFICATION_CREATED',
        notification: result[0],
        userId
      });

      return result[0];
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }

  // Add notification to cache
  addToCache(userId, notification) {
    if (!this.notificationCache.has(userId)) {
      this.notificationCache.set(userId, []);
    }

    const notifications = this.notificationCache.get(userId);
    notifications.unshift(notification);

    // Keep only last 50 notifications per user
    if (notifications.length > 50) {
      notifications.splice(50);
    }

    this.notificationCache.set(userId, notifications);
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 20, unreadOnly = false) {
    try {
      // Check cache first
      if (this.notificationCache.has(userId)) {
        const cachedNotifications = this.notificationCache.get(userId);
        let filtered = cachedNotifications;
        
        if (unreadOnly) {
          filtered = cachedNotifications.filter(n => !n.is_read);
        }
        
        if (filtered.length >= limit) {
          return filtered.slice(0, limit);
        }
      }

      // Fetch from database
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      // Update cache
      if (data && data.length > 0) {
        this.notificationCache.set(userId, data);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error marking notification as read:', error);
        return null;
      }

      // Update cache
      if (this.notificationCache.has(userId)) {
        const notifications = this.notificationCache.get(userId);
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          notifications[index].is_read = true;
          notifications[index].read_at = new Date().toISOString();
        }
      }

      return data[0];
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return null;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return null;
      }

      // Update cache
      if (this.notificationCache.has(userId)) {
        const notifications = this.notificationCache.get(userId);
        notifications.forEach(n => {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        });
      }

      return data;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return null;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      // Check cache first
      if (this.notificationCache.has(userId)) {
        const notifications = this.notificationCache.get(userId);
        return notifications.filter(n => !n.is_read).length;
      }

      // Fetch from database
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  // Clear cache for a user
  clearUserCache(userId) {
    this.notificationCache.delete(userId);
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Helper functions for common notifications
export const notifyCardAssigned = async (cardId, cardTitle, assigneeId, assignedBy, boardId) => {
  return await notificationManager.createNotification({
    userId: assigneeId,
    boardId,
    type: 'card_assigned',
    title: 'Card Assigned',
    message: `You have been assigned to "${cardTitle}"`,
    data: {
      cardId,
      cardTitle,
      assignedBy,
      action: 'assigned'
    },
    priority: 'normal'
  });
};

export const notifyCardMoved = async (cardId, cardTitle, fromColumn, toColumn, userId, boardId) => {
  return await notificationManager.createNotification({
    userId,
    boardId,
    type: 'card_moved',
    title: 'Card Moved',
    message: `"${cardTitle}" moved from ${fromColumn} to ${toColumn}`,
    data: {
      cardId,
      cardTitle,
      fromColumn,
      toColumn,
      action: 'moved'
    },
    priority: 'low'
  });
};

export const notifyCardDue = async (cardId, cardTitle, userId, boardId) => {
  return await notificationManager.createNotification({
    userId,
    boardId,
    type: 'card_due',
    title: 'Card Due Soon',
    message: `"${cardTitle}" is due soon`,
    data: {
      cardId,
      cardTitle,
      action: 'due_soon'
    },
    priority: 'high'
  });
};

export const notifyMention = async (userId, mentionedBy, cardId, cardTitle, boardId) => {
  return await notificationManager.createNotification({
    userId,
    boardId,
    type: 'mention',
    title: 'You were mentioned',
    message: `${mentionedBy} mentioned you in "${cardTitle}"`,
    data: {
      cardId,
      cardTitle,
      mentionedBy,
      action: 'mentioned'
    },
    priority: 'normal'
  });
};

export default notificationManager;
