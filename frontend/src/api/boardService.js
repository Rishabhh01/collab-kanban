// src/api/boardService.js
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("onrender.com")
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");

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
    console.log("API_URL:", API_URL);
    console.log("Board data:", boardData);
    console.log("Auth headers:", getAuthHeaders());
    
    const res = await axios.post(`${API_URL}/boards`, boardData, {
      headers: getAuthHeaders(),
    });
    console.log("Board creation response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error creating board:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
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
    console.log("Fetching board details for ID:", boardId);
    const res = await axios.get(`${API_URL}/boards/${boardId}/details`, {
      headers: getAuthHeaders(),
    });
    console.log("Board details response:", res.data);
    return res.data; // { board, columns, cards }
  } catch (error) {
    console.error("Error fetching board details:", error);
    console.error("Error response:", error.response?.data);
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
