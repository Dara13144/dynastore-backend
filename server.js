const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io for live updates (e.g. payment success notification)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

global.io = io;

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const paymentCheckWorker = require('./services/paymentCheckWorker');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

async function bootstrapDatabase() {
  try {
    await prisma.movie.count();
    console.log('[Database] Schema verified and operational.');
  } catch (err) {
    console.log('[Database] Tables missing. Auto-provisioning database schema...');
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
      const seed = require('./prisma/seed');
      if (typeof seed === 'function') await seed();
    } catch (syncErr) {
      console.warn('[Database Sync Notice]', syncErr.message);
    }
  }
}

server.listen(PORT, async () => {
  console.log(`
  ======================================================
   🛍️ DYNA STORE BACKEND SERVER RUNNING 🛍️
  ======================================================
   - URL: http://localhost:${PORT}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Health Check: http://localhost:${PORT}/api/health
  ======================================================
  `);

  // Ensure tables exist on boot
  await bootstrapDatabase();

  // Start background payment status checking worker
  paymentCheckWorker.start();
});

