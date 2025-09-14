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
import { joinBoard, leaveBoard, getOnlineUsers } from "../api/presenceService";
import websocketService from "../services/websocketService";

const Board = ({ board, columns: initialColumns = [] }) => {
  const [columns, setColumns] = useState(initialColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");
  const [onlineUsers, setOnlineUsers] = useState(board.onlineUsers || []);
  const [isConnected, setIsConnected] = useState(false);

  // Update columns when board changes
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, board.id]);

  // WebSocket and presence management
  useEffect(() => {
    const initializeBoard = async () => {
      try {
        // Connect to WebSocket
        websocketService.connect();
        
        // Join board for presence tracking
        const userInfo = {
          id: localStorage.getItem('userId') || 'anonymous',
          name: localStorage.getItem('userName') || 'Anonymous User',
          email: localStorage.getItem('userEmail') || ''
        };
        
        await joinBoard(board.id);
        websocketService.joinBoard(board.id, userInfo);
        
        // Get initial online users
        const users = await getOnlineUsers(board.id);
        setOnlineUsers(users);
        
        setIsConnected(true);
      } catch (error) {
        console.error('Error initializing board:', error);
      }
    };

    initializeBoard();

    // WebSocket event listeners
    const handleUserJoined = (data) => {
      if (data.boardId === board.id) {
        setOnlineUsers(data.onlineUsers || []);
      }
    };

    const handleUserLeft = (data) => {
      if (data.boardId === board.id) {
        setOnlineUsers(data.onlineUsers || []);
      }
    };

    const handleCardUpdate = (data) => {
      if (data.boardId === board.id) {
        // Update columns with new card data
        setColumns(prevColumns => 
          prevColumns.map(column => {
            if (column.id === data.card.column_id) {
              return {
                ...column,
                cards: column.cards.map(card => 
                  card.id === data.card.id ? data.card : card
                )
              };
            }
            return column;
          })
        );
      }
    };

    const handleCardCreated = (data) => {
      if (data.boardId === board.id) {
        setColumns(prevColumns => 
          prevColumns.map(column => {
            if (column.id === data.card.column_id) {
              return {
                ...column,
                cards: [...(column.cards || []), data.card]
              };
            }
            return column;
          })
        );
      }
    };

    const handleCardDeleted = (data) => {
      if (data.boardId === board.id) {
        setColumns(prevColumns => 
          prevColumns.map(column => ({
            ...column,
            cards: (column.cards || []).filter(card => card.id !== data.cardId)
          }))
        );
      }
    };

    // Add event listeners
    websocketService.on('USER_JOINED_BOARD', handleUserJoined);
    websocketService.on('USER_LEFT_BOARD', handleUserLeft);
    websocketService.on('CARD_UPDATED', handleCardUpdate);
    websocketService.on('CARD_CREATED', handleCardCreated);
    websocketService.on('CARD_DELETED', handleCardDeleted);

    // Cleanup on unmount
    return () => {
      websocketService.off('USER_JOINED_BOARD', handleUserJoined);
      websocketService.off('USER_LEFT_BOARD', handleUserLeft);
      websocketService.off('CARD_UPDATED', handleCardUpdate);
      websocketService.off('CARD_CREATED', handleCardCreated);
      websocketService.off('CARD_DELETED', handleCardDeleted);
      
      // Leave board
      leaveBoard(board.id);
      websocketService.leaveBoard(board.id, localStorage.getItem('userId'));
    };
  }, [board.id]);

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
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-6 shadow-lg border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Project Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{board.title}</h2>
                <p className="text-gray-400 text-sm">Collaborative Kanban Board • Real-time updates</p>
              </div>
            </div>
            
            {/* Project Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{columns.length} columns</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{columns.reduce((total, col) => total + (col.cards?.length || 0), 0)} cards</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Collaboration & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Live Collaboration Status */}
            <div className="flex items-center gap-3">
              {/* Online Users */}
              <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                <div className="flex -space-x-2">
                  {onlineUsers.slice(0, 3).map((user, idx) => (
                    <div key={idx} className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center" title={user.name}>
                      <span className="text-xs text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  ))}
                  {onlineUsers.length > 3 && (
                    <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <span className="text-xs text-gray-300">+{onlineUsers.length - 3}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-300">
                    {onlineUsers.length} online
                  </span>
                </div>
              </div>

              {/* Real-time indicator */}
              <div className={`flex items-center gap-2 text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Live sync' : 'Disconnected'}</span>
              </div>
            </div>

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
            /* Enhanced Empty State */
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center max-w-2xl">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">Welcome to Your Collaborative Kanban Board</h3>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  This is a <span className="text-green-400 font-semibold">real-time collaborative</span> Kanban platform where you and your team can organize tasks, track progress, and work together seamlessly.
                </p>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Real-time Sync</h4>
                    <p className="text-gray-400 text-sm">See changes instantly as your team works</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Team Collaboration</h4>
                    <p className="text-gray-400 text-sm">Work together with live presence indicators</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white mb-2">Drag & Drop</h4>
                    <p className="text-gray-400 text-sm">Intuitive task management with smooth interactions</p>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-6 mb-8 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-3">Get Started:</h4>
                  <div className="text-left space-y-2 text-gray-300">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                      <span>Create columns like <span className="text-green-400 font-semibold">To Do</span>, <span className="text-blue-400 font-semibold">In Progress</span>, <span className="text-purple-400 font-semibold">Done</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                      <span>Add cards with descriptions, due dates, and assignees</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
                      <span>Invite team members to collaborate in real-time</span>
                    </div>
                  </div>
                </div>

                <button
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
                  onClick={() => setIsModalOpen(true)}
                  title="Create your first column"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Column
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