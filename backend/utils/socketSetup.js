import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.io on the given HTTP server.
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // User joins their personal notification room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`[Socket] User ${userId} joined room`);
      }
    });

    socket.on('disconnect', () => {
      // Cleanup handled by socket.io automatically
    });
  });

  return io;
};

/**
 * Get the Socket.io instance.
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized — call initSocket first');
  }
  return io;
};

/**
 * Emit a notification event to a specific user's room.
 */
export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }
};
