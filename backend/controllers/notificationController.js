// Notification Controller for managing user notifications
import notificationManager from '../utils/notificationManager.js';

// ------------------- GET USER NOTIFICATIONS -------------------
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const notifications = await notificationManager.getUserNotifications(
      userId, 
      parseInt(limit), 
      unreadOnly === 'true'
    );

    res.json({
      notifications,
      total: notifications.length
    });
  } catch (err) {
    console.error('Error fetching user notifications:', err);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
};

// ------------------- GET UNREAD COUNT -------------------
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const count = await notificationManager.getUnreadCount(userId);

    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ error: 'Server error while getting unread count' });
  }
};

// ------------------- MARK NOTIFICATION AS READ -------------------
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    const notification = await notificationManager.markAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error while marking notification as read' });
  }
};

// ------------------- MARK ALL NOTIFICATIONS AS READ -------------------
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const notifications = await notificationManager.markAllAsRead(userId);

    res.json({ 
      message: 'All notifications marked as read',
      count: notifications ? notifications.length : 0
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error while marking all notifications as read' });
  }
};

// ------------------- DELETE NOTIFICATION -------------------
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    // Import supabase here to avoid circular dependency
    const { supabase } = await import('../supabaseClient.js');
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear user cache
    notificationManager.clearUserCache(userId);

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Server error while deleting notification' });
  }
};
