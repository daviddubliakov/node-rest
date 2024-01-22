const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    const ioServer = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3000',
      },
    });
    io = ioServer;

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }

    return io;
  },
};
