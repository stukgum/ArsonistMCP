import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeAI } from './config/ai.js';
import { initializeSecurityTools } from './config/security-tools.js';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import vulnerabilityRoutes from './routes/vulnerabilities.js';
import mcpRoutes from './routes/mcp.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './utils/logger.js';

// Load environment variables
// dotenv.config(); // Already loaded at top

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);
app.use('/api/mcp', mcpRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('join-agent-room', (agentId: string) => {
    socket.join(`agent-${agentId}`);
    logger.info('Client joined agent room', { socketId: socket.id, agentId });
  });

  socket.on('leave-agent-room', (agentId: string) => {
    socket.leave(`agent-${agentId}`);
    logger.info('Client left agent room', { socketId: socket.id, agentId });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize AI services
    await initializeAI();

    // Initialize security tools
    await initializeSecurityTools();

    // Start server
    server.listen(PORT, () => {
      logger.info(`Arsonist-MCP Backend Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        frontendUrl: process.env.FRONTEND_URL
      });
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error instanceof Error ? error.message : 'Unknown error' });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();