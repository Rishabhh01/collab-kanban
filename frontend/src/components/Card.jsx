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
          className="bg-gray-700 border border-gray-600 p-4 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 transition-all duration-200 cursor-pointer group"
          onClick={() => setIsEditOpen(true)}
          title="Click to view and edit card details"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-base leading-tight mb-1">{cardData.title}</h3>
              {cardData.description && (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{cardData.description}</p>
              )}
            </div>
            <div className="flex space-x-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditOpen(true);
                }}
                title="Edit this card"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-500 rounded-md transition-all duration-200"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmOpen(true);
                }}
                title="Delete this card"
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all duration-200"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Labels and due date */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex flex-wrap gap-1">
              {cardData.labels?.map((label, idx) => (
                <span key={idx} className="bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 rounded-full text-white text-xs font-medium">
                  {label}
                </span>
              ))}
            </div>
            {cardData.due_date && (
              <div className="flex items-center space-x-1 text-gray-400">
                <CalendarIcon className="w-3 h-3" />
                <span className="text-xs">{cardData.due_date}</span>
              </div>
            )}
          </div>

          {cardData.assignee_id && (
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {cardData.assignee_id.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Assigned to {cardData.assignee_id}</span>
              </div>
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