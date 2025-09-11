import axios from "axios";

const API_BASE = "http://localhost:5000/api";

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
