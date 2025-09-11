import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("onrender.com")
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");

const AuthWrapper = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true } // ✅ Include credentials for CORS
      );
      localStorage.setItem("token", res.data.token);
      toast.success("Logged in successfully");
      onAuthSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async ({ email, password, name }) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/auth/register`,
        { email, password, name },
        { withCredentials: true } // ✅ Include credentials for CORS
      );
      localStorage.setItem("token", res.data.token);
      toast.success("Account created");
      onAuthSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      {mode === "login" ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <SignupForm onSignup={handleSignup} />
      )}
      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 text-sm text-gray-400 hover:text-gray-200"
        disabled={loading}
      >
        {mode === "login"
          ? "Don't have an account? Sign up"
          : "Already have an account? Log in"}
      </button>
    </div>
  );
};

export default AuthWrapper;