import React, { useState } from "react";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md mx-auto"
    >
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-green-500">
          Welcome to Collab Kanban
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Organize tasks, collaborate in real-time, and boost your team's
          productivity 🚀
        </p>
      </div>

      {/* Email Input */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />

      {/* Password Input */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />

      {/* Login Button */}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-semibold transition"
      >
        Log In
      </button>

      {/* Footer Note */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>
          Real-time collaboration powered by{" "}
          <span className="text-yellow-400 font-medium">WebSockets ⚡</span> |{" "}
          <span className="text-orange-400 font-medium">Secure storage</span> using Supabase
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
