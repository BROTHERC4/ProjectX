const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { createRoom, joinRoom, leaveRoom, getRoomData, getAllRooms } = require('./roomManager');
const { handlePlayerInput, startGameInRoom, endGameInRoom } = require('./gameState');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', // Allow connections from any origin (for development)
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 25000
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// If index.html in the root directory, serve that too (for Railway)
app.get('/', (req, res) => {
  if (path.resolve(__dirname, 'index.html')) {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Room management
  socket.on('create_room', (playerName) => {
    const roomId = createRoom(socket.id, playerName);
    socket.join(roomId);
    console.log(`[SERVER] Player ${socket.id} created and joined room ${roomId}`);
    socket.emit('room_created', { roomId, playerId: socket.id });
    io.to(roomId).emit('room_update', getRoomData(roomId));
  });
  
  socket.on('join_room', ({ roomId, playerName }) => {
    const joinResult = joinRoom(roomId, socket.id, playerName);
    if (joinResult.success) {
      socket.join(roomId);
      console.log(`[SERVER] Player ${socket.id} joined room ${roomId}`);
      socket.emit('room_joined', { roomId, playerId: socket.id });
      io.to(roomId).emit('room_update', getRoomData(roomId));
    } else {
      console.log(`[SERVER] Player ${socket.id} failed to join room ${roomId}: ${joinResult.error}`);
      socket.emit('error', { message: joinResult.error });
    }
  });
  
  // Game actions
  socket.on('player_input', (input) => {
    console.log(`[SERVER] Received input from ${socket.id}:`, input);
    const roomId = handlePlayerInput(socket.id, input);
    if (roomId) {
      // We don't emit state here - the game loop will handle that
      console.log(`[SERVER] Input processed for player ${socket.id} in room ${roomId}`);
    } else {
      console.log(`[SERVER] No room found for player ${socket.id}`);
      
      // Get all rooms and check if player exists in any of them
      const allRooms = getAllRooms();
      console.log(`[SERVER] Active rooms: ${JSON.stringify(allRooms)}`);
      
      // Try to recover the room association
      Object.keys(getRoomData() || {}).forEach(id => {
        const room = getRoomData(id);
        if (room && room.players && room.players.some(p => p.id === socket.id)) {
          console.log(`[SERVER] Found player ${socket.id} in room ${id}, but handlePlayerInput failed to associate them`);
          // Re-join the socket to the room to ensure Socket.io connection is right
          socket.join(id);
        }
      });
    }
  });
  
  // Handle player ready status
  socket.on('player_ready', ({ roomId, ready }) => {
    const { setPlayerReady, getRoomData } = require('./roomManager');
    const success = setPlayerReady(roomId, socket.id, ready);
    if (success) {
      const roomData = getRoomData(roomId);
      io.to(roomId).emit('room_update', roomData);
    }
  });
  
  socket.on('start_game', (roomId) => {
    const room = getRoomData(roomId);
    if (room && room.hostId === socket.id) {
      startGameInRoom(roomId, io);
      io.to(roomId).emit('game_started');
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Find which room this player was in
    const affectedRooms = leaveRoom(socket.id);
    
    affectedRooms.forEach(roomId => {
      const roomData = getRoomData(roomId);
      if (roomData) {
        // Update remaining players
        io.to(roomId).emit('room_update', roomData);
        
        // If game was in progress, handle player leaving mid-game
        if (roomData.gameInProgress) {
          // Send player left notification
          io.to(roomId).emit('player_left', { playerId: socket.id });
        }
        
        // If room is empty, end the game loop
        if (roomData.players.length === 0) {
          endGameInRoom(roomId);
        }
      }
    });
    
    console.log('Client disconnected:', socket.id);
  });
});

// List all active rooms (for debug/admin)
app.get('/api/rooms', (req, res) => {
  res.json(getAllRooms());
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 