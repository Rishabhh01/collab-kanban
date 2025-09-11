import React, { useState, useEffect } from "react";

const EditCardModal = ({ isOpen, onClose, card, onCardUpdated }) => {
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [labels, setLabels] = useState(card.labels || []);
  const [dueDate, setDueDate] = useState(card.due_date || "");
  const [assignee, setAssignee] = useState(card.assignee_id || "");

  useEffect(() => {
    if (isOpen) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setLabels(card.labels || []);
      setDueDate(card.due_date || "");
      setAssignee(card.assignee_id || "");
    }
  }, [isOpen, card]);

  const handleSave = () => {
    if (!title.trim()) return;
    const updatedCard = {
      ...card,
      title,
      description,
      labels,
      due_date: dueDate,
      assignee_id: assignee,
    };
    onCardUpdated(updatedCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl text-white">
        <h2 className="text-xl font-semibold mb-4">Edit Card</h2>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <input
            type="text"
            value={labels.join(", ")}
            onChange={(e) => setLabels(e.target.value.split(",").map(l => l.trim()))}
            placeholder="Labels (comma-separated)"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee ID"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-green-600 hover:bg-green-500 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCardModal;