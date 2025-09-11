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
  const [cards, setCards] = useState([]);
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
      } catch (err) {
        toast.error("Failed to load boards");
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleBoardSelect = async (boardId) => {
    try {
      const { board, columns, cards } = await getBoardDetails(boardId);
      setActiveBoardId(board.id);
      setActiveBoard(board);
      setColumns(columns);
      setCards(cards);
    } catch (err) {
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
          setCards([]);
          setActiveBoardId(null);
        }
      }

      toast.success("Board deleted");
    } catch (err) {
      toast.error("Failed to delete board");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    window.location.reload(); // or use navigate("/login") if using React Router
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧭 Your Boards</h1>
            <p className="text-sm text-gray-400">
              Select a board to view and manage its tasks. You can switch between Kanban and Grid views.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 lg:mt-0 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition"
          >
            Logout
          </button>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="text-gray-400">Loading boards...</div>
        ) : boards.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-semibold mb-2">No boards found</p>
            <p className="text-sm">Create a new board to get started.</p>
            <button
              onClick={() => setIsNewBoardOpen(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
            >
              + New Board
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Board Selector */}
            <div className="lg:w-1/4 border-r border-gray-700 pr-4">
              <div className="mb-4">
                <button
                  onClick={() => setIsNewBoardOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
                >
                  + New Board
                </button>
              </div>
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Select a board:</h2>
              <div className="flex flex-col gap-3">
                {boards.map((board) => (
                  <div key={board.id} className="flex items-center justify-between">
                    <button
                      onClick={() => handleBoardSelect(board.id)}
                      className={`px-4 py-2 rounded-lg shadow-sm transition border text-left flex-grow ${
                        board.id === activeBoardId
                          ? "bg-green-600 text-white border-green-500"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-transparent"
                      }`}
                      title={`Open board: ${board.title}`}
                    >
                      {board.title}
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="ml-2 text-red-500 hover:text-red-400 text-sm"
                      title="Delete board"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Board */}
            <div className="flex-grow">
              {activeBoard ? (
                <Board board={activeBoard} columns={columns} cards={cards} />
              ) : (
                <div className="text-center text-gray-400 mt-20">
                  <div className="text-5xl mb-4">📂</div>
                  <p className="text-lg font-semibold mb-2">No columns in this board yet</p>
                  <p className="text-sm">Click “+ Add Column” to start organizing tasks.</p>
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