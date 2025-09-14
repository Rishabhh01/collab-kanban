import React, { useState, useEffect } from "react";
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

const Board = ({ board, columns: initialColumns = [] }) => {
  const [columns, setColumns] = useState(initialColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");

  // Update columns when board changes
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, board.id]);

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

  const handleColumnDeleted = (deletedColumnId) => {
    setColumns(columns.filter(column => column.id !== deletedColumnId));
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-6 shadow-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{board.title}</h2>
            <p className="text-gray-400 text-sm">Organize your tasks and collaborate with your team</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Online Users */}
            {(board.onlineUsers || []).length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">
                  {board.onlineUsers.length} online
                </span>
              </div>
            )}
            {/* View Mode Toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              {["kanban", "grid"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === mode
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                  title={`Switch to ${mode} view`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-700">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {columns.length > 0 ? (
            <div
              className={`${
                viewMode === "kanban"
                  ? "flex gap-6 overflow-x-auto pb-4"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              }`}
            >
              {columns.map((column) => (
                <SortableContext
                  key={column.id}
                  items={(column.cards || []).map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Column column={column} onColumnDeleted={handleColumnDeleted} />
                </SortableContext>
              ))}

              {/* Add Column Button - Only in Kanban view */}
              {viewMode === "kanban" && (
                <button
                  className="flex-shrink-0 w-72 h-16 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400 transition-all duration-200 group"
                  onClick={() => setIsModalOpen(true)}
                  title="Add a new column"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Add Column</span>
                  </div>
                </button>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Create Your First Column</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Organize your tasks into columns like <span className="text-green-400 font-semibold">To Do</span>, 
                  <span className="text-blue-400 font-semibold"> In Progress</span>, and 
                  <span className="text-purple-400 font-semibold"> Done</span>. 
                  Get started by creating your first column below.
                </p>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => setIsModalOpen(true)}
                  title="Create your first column"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create First Column
                  </div>
                </button>
              </div>
            </div>
          )}
        </DndContext>
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