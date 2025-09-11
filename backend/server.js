
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import { createWebSocketServer } from './websocket.js';

// Import routes
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boardRoutes.js';
import columnRoutes from './routes/columnRoutes.js';
import cardRoutes from './routes/cardRoutes.js';

const app = express();
const server = http.createServer(app);

// ✅ Ensure PORT is correctly set for Render
const PORT = process.env.PORT || 5000;

// ✅ Update CORS for production
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// ---------- ROUTES ----------
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards', columnRoutes);
app.use('/api/columns', cardRoutes);

// ---------- ROOT ROUTE ----------
app.get('/', (req, res) => {
  res.send('🚀 Collab Kanban Server is running!');
});

// ---------- WEBSOCKETS ----------
createWebSocketServer(server);

// ---------- START SERVER ----------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
