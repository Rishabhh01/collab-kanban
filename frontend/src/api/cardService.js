import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("onrender.com")
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");

export const getCards = async (columnId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/cards/${columnId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching cards:", err);
    return [];
  }
};

export const createCard = async ({ title, description, column_id }) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE}/cards`,
      { title, description, column_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Error creating card:", err);
    return null;
  }
};

