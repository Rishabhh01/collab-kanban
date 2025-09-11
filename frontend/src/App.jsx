import React, { useEffect, useState } from "react";
import BoardDashboard from "./components/BoardDashboard";
import AuthWrapper from "./components/auth/AuthWrapper";
import { Toaster } from "react-hot-toast";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isAuthenticated ? (
        <BoardDashboard />
      ) : (
        <AuthWrapper onAuthSuccess={handleAuthSuccess} />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;