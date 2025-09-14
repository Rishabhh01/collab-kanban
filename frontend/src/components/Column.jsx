import React, { useState } from "react";
import Card from "./Card";
import AddCardModal from "./modals/AddCardModal";
import ConfirmModal from "./modals/ConfirmModal";
import { deleteColumn } from "../api/columnService";
import toast from "react-hot-toast";

const Column = ({ column, onColumnDeleted }) => {
  const [cards, setCards] = useState(column.cards || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCardAdded = (newCard) => {
    setCards((prev) => [...prev, newCard]);
  };

  const handleCardDeleted = (deletedId) => {
    setCards((prev) => prev.filter((card) => card.id !== deletedId));
  };

  const handleDeleteColumn = async () => {
    try {
      await deleteColumn(column.id);
      if (onColumnDeleted) {
        onColumnDeleted(column.id);
      }
      toast.success("Column deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete column:", error);
      toast.error("Failed to delete column");
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl w-72 flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-700">
      {/* Column Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-semibold text-lg truncate">{column.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all duration-200"
              title="Add a new card to this column"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Card
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
              title="Delete this column"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-400">{cards.length} cards</span>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 min-h-[200px]">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-center">No cards yet</p>
            <p className="text-xs text-gray-500 mt-1">Click "Add Card" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                columnId={column.id}
                onCardDeleted={handleCardDeleted}
              />
            ))}
          </div>
        )}
      </div>

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        columnId={column.id}
        onCardAdded={handleCardAdded}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteColumn}
        message={`Are you sure you want to delete the "${column.title}" column? This will also delete all cards in this column.`}
      />
    </div>
  );
};

export default Column;