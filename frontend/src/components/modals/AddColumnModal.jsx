// src/components/modals/AddColumnModal.jsx
import React, { useState } from "react";
import { addColumn } from "../../api/boardService";

const AddColumnModal = ({ isOpen, onClose, boardId, onColumnAdded }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Column title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newColumn = await addColumn(boardId, { title, order: 0 });
      onColumnAdded(newColumn);
      setTitle("");
      onClose();
    } catch (err) {
      setError("Failed to add column. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Add New Column</h2>
        {error && <p className="text-red-400 mb-2">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter column title"
            className="w-full p-2 rounded bg-gray-700 text-white outline-none mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-white"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnModal;