// Activity Controller for managing activity feeds
import activityLogger from '../utils/activityLogger.js';

// ------------------- GET BOARD ACTIVITIES -------------------
export const getBoardActivities = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const activities = await activityLogger.getBoardActivities(boardId, parseInt(limit));

    // Apply offset
    const paginatedActivities = activities.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      activities: paginatedActivities,
      total: activities.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Error fetching board activities:', err);
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};

// ------------------- GET USER ACTIVITIES -------------------
export const getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const activities = await activityLogger.getUserActivities(userId, parseInt(limit));

    // Apply offset
    const paginatedActivities = activities.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      activities: paginatedActivities,
      total: activities.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Error fetching user activities:', err);
    res.status(500).json({ error: 'Server error while fetching user activities' });
  }
};

// ------------------- GET ACTIVITY STATISTICS -------------------
export const getActivityStats = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { days = 7 } = req.query;

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const stats = await activityLogger.getActivityStats(boardId, parseInt(days));

    if (!stats) {
      return res.status(500).json({ error: 'Failed to fetch activity statistics' });
    }

    res.json(stats);
  } catch (err) {
    console.error('Error fetching activity stats:', err);
    res.status(500).json({ error: 'Server error while fetching activity statistics' });
  }
};

// ------------------- GET RECENT ACTIVITIES (DASHBOARD) -------------------
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Get user's recent activities across all boards
    const activities = await activityLogger.getUserActivities(userId, parseInt(limit));

    res.json({
      activities,
      total: activities.length
    });
  } catch (err) {
    console.error('Error fetching recent activities:', err);
    res.status(500).json({ error: 'Server error while fetching recent activities' });
  }
};
