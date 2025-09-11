# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy all frontend files
COPY frontend/ ./

# Build production-ready static files
RUN npm run build


# ---------- Stage 2: Setup Backend ----------
FROM node:18-alpine

# Set working directory for backend
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source code
COPY backend/ ./backend

# Copy built frontend files into backend public folder
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "backend/server.js"]
