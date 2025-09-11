import React, { useState } from "react";
import Column from "./Column";
import AddColumnModal from "./modals/AddColumnModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Board = ({ board }) => {
  const [columns, setColumns] = useState(board.columns || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumnIndex = columns.findIndex((col) =>
      col.cards?.some((card) => card.id === active.id)
    );
    const targetColumnIndex = columns.findIndex(
      (col) => col.id === over.data.current?.columnId
    );

    if (sourceColumnIndex === -1 || targetColumnIndex === -1) return;

    const sourceColumn = columns[sourceColumnIndex];
    const targetColumn = columns[targetColumnIndex];
    const draggedCard = sourceColumn.cards.find((card) => card.id === active.id);

    const updatedSourceCards = sourceColumn.cards.filter(
      (card) => card.id !== active.id
    );
    const updatedTargetCards = [...(targetColumn.cards || []), draggedCard];

    const updatedColumns = [...columns];
    updatedColumns[sourceColumnIndex] = {
      ...sourceColumn,
      cards: updatedSourceCards,
    };
    updatedColumns[targetColumnIndex] = {
      ...targetColumn,
      cards: updatedTargetCards,
    };

    setColumns(updatedColumns);
  };

  const handleColumnAdded = (newColumn) => {
    setColumns([...columns, { ...newColumn, cards: [] }]);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-screen-lg px-4 mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{board.title}</h2>
        <div className="flex space-x-2">
          {["kanban", "grid"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                viewMode === mode
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title={`Switch to ${mode} view`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Online Users */}
      <div className="w-full max-w-screen-lg px-4 mb-4 flex space-x-2">
        {(board.onlineUsers || []).map((user, idx) => (
          <div
            key={idx}
            className="bg-green-600 text-white text-xs px-2 py-1 rounded-full"
            title={`Online: ${user}`}
          >
            {user}
          </div>
        ))}
      </div>

      {/* Board Content */}
      <div className="w-full bg-gray-900 rounded-lg px-4 py-6">
        <div className="flex justify-center">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div
              className={`${
                viewMode === "kanban"
                  ? "flex space-x-6"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              } max-w-screen-lg w-full min-w-max pb-4`}
            >
              {columns.map((column) => (
                <SortableContext
                  key={column.id}
                  items={(column.cards || []).map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Column column={column} />
                </SortableContext>
              ))}

              {columns.length > 0 && (
                <button
                  className="h-12 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition flex-shrink-0"
                  onClick={() => setIsModalOpen(true)}
                  title="Add a new column"
                >
                  + Add Column
                </button>
              )}
            </div>
          </DndContext>

          {/* Empty State */}
          {columns.length === 0 && (
            <div className="flex items-center justify-center w-full min-h-[400px]">
              <div className="text-center text-gray-400 px-4 max-w-md">
                <div className="text-6xl mb-4">🗂️</div>
                <h3 className="text-xl font-semibold text-white mb-2">No columns yet</h3>
                <p className="text-sm mb-4">
                  These boards help you organize tasks into columns like <strong>To Do</strong>, <strong>In Progress</strong>, and <strong>Done</strong>.
                  Click <span className="text-green-400 font-medium">+ Add Column</span> to get started.
                </p>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
                  onClick={() => setIsModalOpen(true)}
                  title="Create your first column"
                >
                  + Add Column
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddColumnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boardId={board.id}
        onColumnAdded={handleColumnAdded}
      />
    </div>
  );
};

export default Board;