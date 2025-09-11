// src/api/boardService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// ---------- Boards ----------
export const getBoards = async () => {
  try {
    const res = await axios.get(`${API_URL}/boards`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    return [];
  }
};

export const getBoardsWithColumns = async () => {
  try {
    const res = await axios.get(`${API_URL}/boards?include=columns,cards`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching boards with columns:", error);
    return [];
  }
};

export const createBoard = async (boardData) => {
  try {
    const res = await axios.post(`${API_URL}/boards`, boardData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
};

export const deleteBoard = async (boardId) => {
  try {
    const res = await axios.delete(`${API_URL}/boards/${boardId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};

export const getBoardDetails = async (boardId) => {
  try {
    const res = await axios.get(`${API_URL}/boards/${boardId}/details`, {
      headers: getAuthHeaders(),
    });
    return res.data; // { board, columns, cards }
  } catch (error) {
    console.error("Error fetching board details:", error);
    throw error;
  }
};

// ---------- Columns ----------
export const addColumn = async (boardId, columnData) => {
  try {
    const payload = {
      title: columnData.title,
      order: columnData.order ?? 0, // default order
    };

    const res = await axios.post(
      `${API_URL}/boards/${boardId}/columns`,
      payload,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    console.error("Error adding column:", error.response?.data || error.message);
    throw error;
  }
};


export const updateColumn = async (columnId, columnData) => {
  try {
    const res = await axios.put(`${API_URL}/columns/${columnId}`, columnData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error updating column:", error);
    throw error;
  }
};

// ---------- Cards ----------

export const addCard = async (columnId, cardData) => {
  try {
    const res = await axios.post(`${API_URL}/columns/${columnId}/cards`, cardData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error adding card:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCard = async (cardId, cardData) => {
  try {
    const res = await axios.put(`${API_URL}/cards/${cardId}`, cardData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

export const deleteCard = async (cardId) => {
  try {
    await axios.delete(`${API_URL}/cards/${cardId}`, {
      headers: getAuthHeaders(),
    });
    return { message: "Card deleted successfully" };
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};
