import React, { useEffect, useState } from "react";
import {
  getBoards,
  getBoardDetails,
  deleteBoard,
} from "../api/boardService";
import Board from "./Board";
import toast from "react-hot-toast";
import NewBoardModal from "./modals/NewBoardModal";
import ActivityFeed from "./ActivityFeed";
import HelpModal from "./HelpModal";

const BoardDashboard = () => {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getBoards();
        setBoards(data);
        if (data.length > 0) {
          await handleBoardSelect(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load boards:", error);
        toast.error("Failed to load boards");
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            setIsNewBoardOpen(true);
            break;
          case '/':
            event.preventDefault();
            setIsHelpOpen(true);
            break;
          default:
            break;
        }
      } else if (event.key === 'Escape') {
        setIsNewBoardOpen(false);
        setIsActivityOpen(false);
        setIsHelpOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBoardSelect = async (boardId) => {
    try {
      const { board, columns } = await getBoardDetails(boardId);
      setActiveBoardId(board.id);
      setActiveBoard(board);
      setColumns(columns);
    } catch (error) {
      console.error("Failed to load board details:", error);
      toast.error("Failed to load board details");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      await deleteBoard(boardId);
      const updatedBoards = boards.filter((b) => b.id !== boardId);
      setBoards(updatedBoards);

      if (activeBoardId === boardId) {
        const fallbackBoard = updatedBoards[0];
        if (fallbackBoard) {
          await handleBoardSelect(fallbackBoard.id);
        } else {
          setActiveBoard(null);
          setColumns([]);
          setActiveBoardId(null);
        }
      }

      toast.success("Board deleted");
    } catch (error) {
      console.error("Failed to delete board:", error);
      toast.error("Failed to delete board");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    window.location.reload(); // or use navigate("/login") if using React Router
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Collaborative Kanban
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Real-time project management and team collaboration platform
                  </p>
                </div>
              </div>
              
              {/* Platform Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live collaboration enabled</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{boards.length} boards</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Real-time sync</span>
                </div>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-3">
              {/* Activity Feed Button */}
              <button
                onClick={() => setIsActivityOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                title="View recent activity and notifications"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                </svg>
                Activity
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              
              {/* Help Button */}
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Get help and learn about features (Ctrl+/)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading boards...</p>
            </div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Welcome to Collaborative Kanban</h3>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg max-w-2xl mx-auto">
              Create your first board to start organizing projects, tracking tasks, and collaborating with your team in real-time.
            </p>
            
            {/* Quick Start Guide */}
            <div className="bg-gray-800/30 rounded-lg p-6 mb-8 border border-gray-700 max-w-2xl mx-auto">
              <h4 className="text-lg font-semibold text-white mb-4">What you can do:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Real-time Collaboration</h5>
                    <p className="text-gray-400 text-sm">See team members online and their activities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Drag & Drop Tasks</h5>
                    <p className="text-gray-400 text-sm">Move cards between columns effortlessly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Task Management</h5>
                    <p className="text-gray-400 text-sm">Assign tasks, set due dates, add labels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Activity Tracking</h5>
                    <p className="text-gray-400 text-sm">Monitor progress with audit logs</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsNewBoardOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Board
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Enhanced Board Selector */}
            <div className="xl:w-80 flex-shrink-0">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="mb-6">
                  <button
                    onClick={() => setIsNewBoardOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    title="Create a new board (Ctrl+N)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Board
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Your Boards</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {boards.map((board) => (
                    <div key={board.id} className="group">
                      <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50">
                        <button
                          onClick={() => handleBoardSelect(board.id)}
                          className={`flex-1 text-left px-3 py-3 rounded-lg transition-all duration-200 ${
                            board.id === activeBoardId
                              ? "bg-green-600 text-white shadow-lg"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                          }`}
                          title={`Open board: ${board.title}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                              </svg>
                            </div>
                            <div className="font-medium truncate">{board.title}</div>
                          </div>
                          <div className="text-xs opacity-75">
                            {board.columns?.length || 0} columns • {board.cards?.length || 0} cards
                          </div>
                        </button>
                        <button
                          onClick={() => handleDeleteBoard(board.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                          title="Delete board"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <h4 className="text-sm font-semibold text-white mb-2">💡 Quick Tips</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Drag cards between columns</li>
                    <li>• Click cards to edit details</li>
                    <li>• See team members online</li>
                    <li>• Real-time updates sync automatically</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Active Board */}
            <div className="flex-1 min-w-0">
              {activeBoard ? (
                <Board board={activeBoard} columns={columns} />
              ) : (
                <div className="text-center text-gray-400 mt-20">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold mb-2 text-white">No columns in this board yet</p>
                  <p className="text-sm">Click "+ Add Column" to start organizing tasks.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Board Modal */}
        <NewBoardModal
          isOpen={isNewBoardOpen}
          onClose={() => setIsNewBoardOpen(false)}
          onBoardCreated={async (newBoard) => {
            const updatedBoards = [...boards, newBoard];
            setBoards(updatedBoards);
            await handleBoardSelect(newBoard.id);
          }}
        />

        {/* Activity Feed Modal */}
        <ActivityFeed
          isOpen={isActivityOpen}
          onClose={() => setIsActivityOpen(false)}
          boardId={activeBoardId}
        />

        {/* Help Modal */}
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    </div>
  );
};

export default BoardDashboard;