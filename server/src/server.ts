import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/database.js';
import { initializeSocketIO } from './socket/socket.handler.js';

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Setup socket event handlers
initializeSocketIO(io);

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 PulseChat Server running on port ${ENV.PORT}`);
    console.log(`📡 Real-Time Socket.IO Server Ready`);
    console.log(`⚡ Environment: ${ENV.NODE_ENV}`);
    console.log(`=================================================`);
  });
};

startServer();
