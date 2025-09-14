import React, { useEffect, useState } from "react";
import {
  getBoards,
  getBoardDetails,
  deleteBoard,
} from "../api/boardService";
import Board from "./Board";
import toast from "react-hot-toast";
import NewBoardModal from "./modals/NewBoardModal";

const BoardDashboard = () => {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                🧭 Your Boards
              </h1>
              <p className="text-gray-400 text-sm max-w-md">
                Select a board to view and manage its tasks. You can switch between Kanban and Grid views.
              </p>
            </div>
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
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-2 text-white">No boards found</p>
            <p className="text-sm mb-6">Create a new board to get started organizing your tasks.</p>
            <button
              onClick={() => setIsNewBoardOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Board
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Board Selector */}
            <div className="xl:w-80 flex-shrink-0">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="mb-6">
                  <button
                    onClick={() => setIsNewBoardOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Board
                  </button>
                </div>
                <h2 className="text-lg font-semibold mb-4 text-white">Your Boards</h2>
                <div className="space-y-3">
                  {boards.map((board) => (
                    <div key={board.id} className="group">
                      <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50">
                        <button
                          onClick={() => handleBoardSelect(board.id)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                            board.id === activeBoardId
                              ? "bg-green-600 text-white shadow-lg"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                          }`}
                          title={`Open board: ${board.title}`}
                        >
                          <div className="font-medium truncate">{board.title}</div>
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
      </div>
    </div>
  );
};

export default BoardDashboard;