import React, { useState } from "react";

const AddCardModal = ({ isOpen, onClose, columnId, onCardAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    const newCard = {
      id: Date.now().toString(), // Replace with backend-generated ID
      columnId,
      title,
      description,
      labels,
      due_date: dueDate,
      assignee_id: assignee,
    };
    onCardAdded(newCard);
    onClose();
    setTitle("");
    setDescription("");
    setLabels([]);
    setDueDate("");
    setAssignee("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl text-white">
        <h2 className="text-xl font-semibold mb-4">Add New Card</h2>

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
            onClick={handleAdd}
            className="px-4 py-1 bg-green-600 hover:bg-green-500 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;