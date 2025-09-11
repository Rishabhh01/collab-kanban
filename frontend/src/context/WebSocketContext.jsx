import React, { createContext, useEffect, useState } from "react";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => console.log("WebSocket connected!");
    socket.onclose = () => console.log("WebSocket disconnected!");
    socket.onerror = (err) => console.error("WebSocket error:", err);

    setWs(socket);

    return () => socket.close();
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};
