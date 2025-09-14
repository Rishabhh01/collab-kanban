import React, { useState, useEffect } from "react";
import { getBoardActivities } from "../api/activityService";

const ActivityFeed = ({ isOpen, onClose, boardId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load activities when modal opens
  useEffect(() => {
    if (isOpen && boardId) {
      loadActivities();
    }
  }, [isOpen, boardId]);

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBoardActivities(boardId, 20);
      setActivities(data.activities || []);
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format activity for display
  const formatActivity = (activity) => {
    const timeAgo = new Date(activity.timestamp).toLocaleString();
    let icon = "📝";
    let color = "text-gray-400";
    let message = "";

    switch (activity.action) {
      case 'created':
        if (activity.target_type === 'card') {
          icon = "📝";
          color = "text-green-400";
          message = `created a new card "${activity.target_title}"`;
        } else if (activity.target_type === 'column') {
          icon = "📋";
          color = "text-blue-400";
          message = `created column "${activity.target_title}"`;
        }
        break;
      case 'updated':
        if (activity.target_type === 'card') {
          icon = "✏️";
          color = "text-yellow-400";
          message = `updated "${activity.target_title}"`;
        }
        break;
      case 'moved':
        icon = "🔄";
        color = "text-blue-400";
        const details = JSON.parse(activity.details || '{}');
        message = `moved "${activity.target_title}" from ${details.fromColumn || 'unknown'} to ${details.toColumn || 'unknown'}`;
        break;
      case 'assigned':
        icon = "👤";
        color = "text-purple-400";
        message = `assigned "${activity.target_title}"`;
        break;
      case 'deleted':
        icon = "🗑️";
        color = "text-red-400";
        message = `deleted "${activity.target_title}"`;
        break;
      default:
        message = `${activity.action} "${activity.target_title}"`;
    }

    return {
      id: activity.id,
      user: activity.user_name || 'Unknown User',
      message,
      time: timeAgo,
      icon,
      color
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Activity Feed</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Activity List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Loading activities...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button 
                onClick={loadActivities}
                className="text-green-400 text-sm hover:text-green-300"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const formatted = formatActivity(activity);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                    <div className="text-2xl">{formatted.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">{formatted.user}</span>
                        <span className={`text-sm ${formatted.color}`}>{formatted.message}</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatted.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Empty state for no activities */}
          {!loading && !error && activities.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-700/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Real-time updates</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
