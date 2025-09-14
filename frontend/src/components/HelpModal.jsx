import React from "react";

const HelpModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: "Ctrl + N", description: "Create new board" },
    { key: "Ctrl + C", description: "Create new card" },
    { key: "Ctrl + /", description: "Show this help" },
    { key: "Esc", description: "Close modals" },
    { key: "Space", description: "Quick add card" },
  ];

  const features = [
    {
      icon: "🔄",
      title: "Real-time Collaboration",
      description: "See team members online and their activities in real-time. All changes sync instantly across all connected users."
    },
    {
      icon: "🎯",
      title: "Drag & Drop",
      description: "Move cards between columns effortlessly. The interface provides visual feedback during drag operations."
    },
    {
      icon: "👥",
      title: "Team Management",
      description: "Assign tasks to team members, set due dates, add labels, and track progress with visual indicators."
    },
    {
      icon: "📊",
      title: "Activity Tracking",
      description: "Monitor all board activities with detailed audit logs. See who did what and when."
    },
    {
      icon: "🔔",
      title: "Notifications",
      description: "Get notified about important events like card assignments, mentions, and board changes."
    },
    {
      icon: "⚡",
      title: "Optimistic Updates",
      description: "Experience smooth interactions with instant UI updates and conflict resolution."
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Help & Features</h2>
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

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Welcome Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Welcome to Collaborative Kanban</h3>
            <p className="text-gray-300 leading-relaxed">
              This is a real-time collaborative project management platform built with modern web technologies. 
              Work together with your team to organize tasks, track progress, and achieve your goals efficiently.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Keyboard Shortcuts</h3>
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Getting Started</h3>
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">1</span>
                  <span>Create your first board by clicking "New Board" in the sidebar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">2</span>
                  <span>Add columns like "To Do", "In Progress", and "Done" to organize your workflow</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">3</span>
                  <span>Create cards for your tasks and assign them to team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">4</span>
                  <span>Invite team members to collaborate and see real-time updates</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Built With</h3>
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="text-gray-300">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="text-sm font-medium">React.js</div>
                </div>
                <div className="text-gray-300">
                  <div className="text-2xl mb-2">🟢</div>
                  <div className="text-sm font-medium">Node.js</div>
                </div>
                <div className="text-gray-300">
                  <div className="text-2xl mb-2">🔌</div>
                  <div className="text-sm font-medium">WebSockets</div>
                </div>
                <div className="text-gray-300">
                  <div className="text-2xl mb-2">🗄️</div>
                  <div className="text-sm font-medium">Supabase</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-700/30">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Need more help? Contact support</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
