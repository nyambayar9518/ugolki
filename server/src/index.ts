import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { RoomManager } from './rooms';
import { CornerMode, Move, TurnTimer } from './types';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Production static file serving
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      // In dev mode when client/dist doesn't exist yet, return helpful message
      res.status(200).send('Ugolki Server Running. Frontend is running on Vite dev port or build client/dist first.');
    }
  });
});

// Socket.io handlers
io.on('connection', socket => {
  // Create Room
  socket.on(
    'createRoom',
    (
      data: { name: string; cornerMode: CornerMode; turnTimer: TurnTimer },
      callback?: (res: { roomId: string }) => void
    ) => {
      const room = roomManager.createRoom(
        socket.id,
        data.name,
        data.cornerMode || '3x4',
        data.turnTimer !== undefined ? data.turnTimer : 60
      );
      socket.join(room.roomId);
      socket.emit('roomUpdated', room);
      io.emit('publicRoomsList', roomManager.getPublicRooms());
      if (callback) callback({ roomId: room.roomId });
    }
  );

  // Join Room
  socket.on(
    'joinRoom',
    (
      data: { roomId: string; name: string },
      callback?: (res: { success: boolean; message?: string }) => void
    ) => {
      const result = roomManager.joinRoom(data.roomId, socket.id, data.name);
      if (!result.success || !result.room) {
        if (callback) callback({ success: false, message: result.message });
        socket.emit('error', { message: result.message || 'Unable to join room' });
        return;
      }

      socket.join(result.room.roomId);
      io.to(result.room.roomId).emit('roomUpdated', result.room);
      io.emit('publicRoomsList', roomManager.getPublicRooms());
      if (callback) callback({ success: true });
    }
  );

  // Make Move
  socket.on('makeMove', (data: { roomId: string; move: Move }) => {
    const result = roomManager.makeMove(data.roomId, socket.id, data.move);
    if (result.success && result.room) {
      io.to(result.room.roomId).emit('roomUpdated', result.room);
      io.emit('publicRoomsList', roomManager.getPublicRooms());
    } else {
      socket.emit('error', { message: result.message || 'Illegal move' });
    }
  });

  // Surrender / Resign
  socket.on('surrender', (data: { roomId: string }) => {
    const updated = roomManager.surrender(data.roomId, socket.id);
    if (updated) {
      io.to(updated.roomId).emit('roomUpdated', updated);
      io.emit('publicRoomsList', roomManager.getPublicRooms());
    }
  });

  // Rematch
  socket.on('requestRematch', (data: { roomId: string }) => {
    const reset = roomManager.resetMatch(data.roomId);
    if (reset) {
      io.to(reset.roomId).emit('roomUpdated', reset);
      io.emit('publicRoomsList', roomManager.getPublicRooms());
    }
  });

  // Quick Chat & Reactions
  socket.on(
    'sendChat',
    (data: { roomId: string; sender: string; text: string; isEmoji?: boolean }) => {
      const ctx = roomManager.getSocketContext(socket.id);
      const msg = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: data.sender || 'Player',
        playerNum: ctx?.playerNum,
        text: data.text,
        isEmoji: Boolean(data.isEmoji),
        timestamp: Date.now()
      };
      io.to(data.roomId).emit('chatMessage', msg);
    }
  );

  // Get Public Rooms
  socket.on('getPublicRooms', () => {
    socket.emit('publicRoomsList', roomManager.getPublicRooms());
  });

  // Disconnect
  socket.on('disconnect', () => {
    const { roomId, room } = roomManager.handleDisconnect(socket.id);
    if (roomId && room) {
      io.to(roomId).emit('roomUpdated', room);
      io.emit('publicRoomsList', roomManager.getPublicRooms());
    }
  });
});

// Periodic timer ticker for turn countdowns
setInterval(() => {
  const { expiredRooms, updatedRooms } = roomManager.tickTimers();

  for (const { roomId, timeLeft } of updatedRooms) {
    io.to(roomId).emit('timerTick', timeLeft);
  }

  for (const room of expiredRooms) {
    io.to(room.roomId).emit('roomUpdated', room);
  }
}, 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Ugolki Server] Listening on http://localhost:${PORT}`);
});
