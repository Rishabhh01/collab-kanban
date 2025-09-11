
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWebSocketServer } from './websocket.js';

// Import routes
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boardRoutes.js';
import columnRoutes from './routes/columnRoutes.js';
import cardRoutes from './routes/cardRoutes.js';

const app = express();
const server = http.createServer(app);

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Port for Render
const PORT = process.env.PORT || 5000;

// ✅ CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// ---------- API ROUTES ----------
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards', columnRoutes);
app.use('/api/columns', cardRoutes);

// ---------- STATIC FRONTEND ----------
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Catch-all route for React deep links
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- WEBSOCKETS ----------
createWebSocketServer(server);

// ---------- START SERVER ----------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CollabKanban server running on port ${PORT}`);
});