import React, { useState } from "react";
import Card from "./Card";
import AddCardModal from "./modals/AddCardModal";

const Column = ({ column }) => {
  const [cards, setCards] = useState(column.cards || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardAdded = (newCard) => {
    setCards((prev) => [...prev, newCard]);
  };

  const handleCardDeleted = (deletedId) => {
    setCards((prev) => prev.filter((card) => card.id !== deletedId));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg w-72 flex-shrink-0 shadow-md hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">{column.title}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-green-400 hover:text-green-300"
          title="Add a new card to this column"
        >
          + Add Card
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-400 italic text-sm">No cards in this column yet.</p>
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

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        columnId={column.id}
        onCardAdded={handleCardAdded}
      />
    </div>
  );
};

export default Column;