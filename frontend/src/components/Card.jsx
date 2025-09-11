import React, { useState } from "react";
import { TrashIcon, CalendarIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useDraggable } from "@dnd-kit/core";
import EditCardModal from "./modals/EditCardModal";
import ConfirmModal from "./modals/ConfirmModal";
import toast from "react-hot-toast";

const Card = ({ card, columnId, onCardDeleted }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { columnId },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [cardData, setCardData] = useState(card);

  const handleCardUpdated = (updatedCard) => {
    setCardData(updatedCard);
  };

  const handleDeleteConfirmed = async () => {
    try {
      // TODO: Replace with actual API call
      // await deleteCard(card.id);
      if (typeof onCardDeleted === "function") {
        onCardDeleted(card.id);
      }
      toast.success("Card deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete card");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className="cursor-grab"
      >
        <div
          className="bg-gray-700 border border-gray-600 p-3 rounded-lg shadow hover:bg-gray-600 transition cursor-pointer"
          onClick={() => setIsEditOpen(true)}
          title="Click to view and edit card details"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{cardData.title}</h3>
              {cardData.description && (
                <p className="text-gray-300 text-sm mt-1">{cardData.description}</p>
              )}
            </div>
            <div className="flex space-x-2 items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditOpen(true);
                }}
                title="Edit this card"
                className="text-gray-300 hover:text-white flex items-center space-x-1"
              >
                <PencilIcon className="w-4 h-4" />
                <span className="text-xs">Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmOpen(true);
                }}
                title="Delete this card"
              >
                <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* Labels and due date */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-300">
            <div className="flex flex-wrap gap-1">
              {cardData.labels?.map((label, idx) => (
                <span key={idx} className="bg-blue-500 px-2 py-0.5 rounded-full text-white">
                  {label}
                </span>
              ))}
            </div>
            {cardData.due_date && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span>{cardData.due_date}</span>
              </div>
            )}
          </div>

          {cardData.assignee_id && (
            <div className="mt-2 text-xs text-gray-400">
              Assigned to: {cardData.assignee_id}
            </div>
          )}
        </div>
      </div>

      <EditCardModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        card={cardData}
        onCardUpdated={handleCardUpdated}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        message="Are you sure you want to delete this card?"
      />
    </>
  );
};

export default Card;