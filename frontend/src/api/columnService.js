import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("onrender.com")
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");

export const getColumns = async (boardId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/columns/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching columns:", err);
    return [];
  }
};

export const createColumn = async ({ title, board_id }) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE}/columns`,
      { title, board_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Error creating column:", err);
    return null;
  }
};

export const deleteColumn = async (columnId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_BASE}/boards/columns/${columnId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting column:", err);
    throw err;
  }
};