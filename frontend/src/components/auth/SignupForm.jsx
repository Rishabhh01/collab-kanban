import React, { useState } from "react";

const SignupForm = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // ✅ Add name state

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSignup({ email, password, name }); // ✅ Pass name to handler
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Sign Up</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-gray-700 text-white"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;