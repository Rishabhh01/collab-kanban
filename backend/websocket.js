// websocket.js
import { WebSocketServer } from 'ws';

let wss;

export const createWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('A user connected');

    ws.on('message', (message) => {
      // Broadcast message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(message.toString());
        }
      });
    });

    ws.on('close', () => {
      console.log('A user disconnected');
    });
  });

  console.log('WebSocket server running');
};

// Send data from server to all clients
export const broadcastUpdate = (data) => {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};
