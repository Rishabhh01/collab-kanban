# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# ---------- Stage 2: Setup Backend ----------
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source code
COPY backend/ ./backend

# Copy built frontend into backend public folder
COPY --from=frontend-build /app/frontend/dist ./backend/public

# ✅ Expose dynamic port (Render uses PORT env)
EXPOSE 3000

# ✅ Start backend (uses process.env.PORT internally)
CMD ["node", "backend/server.js"]