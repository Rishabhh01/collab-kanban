import React, { useState } from "react";
import Modal from "./Modal"; // Reuse your existing modal wrapper
import { createBoard } from "../../api/boardService";
import toast from "react-hot-toast";

const NewBoardModal = ({ isOpen, onClose, onBoardCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Board title is required");
      return;
    }

    try {
      console.log("Creating board with data:", { title, description });
      const newBoard = await createBoard({ title, description });
      console.log("Board created successfully:", newBoard);
      onBoardCreated(newBoard);
      toast.success("Board created successfully!");
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create board:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create board";
      toast.error(`Failed to create board: ${errorMessage}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Board">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <textarea
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition"
        >
          Create Board
        </button>
      </div>
    </Modal>
  );
};

export default NewBoardModal;