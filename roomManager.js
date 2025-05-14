// Room management for multiplayer game
const { v4: uuidv4 } = require('uuid');

// In-memory store of all game rooms
const rooms = {};

// Constants
const MAX_PLAYERS_PER_ROOM = 4;

/**
 * Create a new game room
 * @param {string} hostId - Socket ID of the room creator/host
 * @param {string} hostName - Display name of the host
 * @returns {string} - Room ID
 */
function createRoom(hostId, hostName) {
  const roomId = uuidv4().substring(0, 6).toUpperCase(); // Short room code
  
  // Assign unique X position for the host (player 0)
  const numPlayers = MAX_PLAYERS_PER_ROOM;
  const spacing = 600 / (numPlayers - 1); // Spread across 200 to 800
  const x = 200;
  
  rooms[roomId] = {
    id: roomId,
    hostId: hostId,
    players: [{
      id: hostId,
      name: hostName || `Player ${1}`,
      score: 0,
      lives: 3,
      ready: false,
      position: { x: x, y: 550 }
    }],
    gameInProgress: false,
    gameState: null,
    gameInterval: null,
    createdAt: Date.now()
  };
  
  return roomId;
}

/**
 * Join an existing room
 * @param {string} roomId - Room ID to join
 * @param {string} playerId - Socket ID of joining player
 * @param {string} playerName - Display name of joining player
 * @returns {object} - Result of join attempt
 */
function joinRoom(roomId, playerId, playerName) {
  // Check if room exists
  if (!rooms[roomId]) {
    return { success: false, error: 'Room not found' };
  }
  
  // Check if room is full
  if (rooms[roomId].players.length >= MAX_PLAYERS_PER_ROOM) {
    return { success: false, error: 'Room is full' };
  }
  
  // Check if game already started
  if (rooms[roomId].gameInProgress) {
    return { success: false, error: 'Game already in progress' };
  }
  
  // Check if player is already in the room
  const existingPlayerIndex = rooms[roomId].players.findIndex(p => p.id === playerId);
  if (existingPlayerIndex >= 0) {
    return { success: true }; // Player already in room
  }
  
  // Assign unique X position for each player
  const playerIndex = rooms[roomId].players.length;
  const numPlayers = MAX_PLAYERS_PER_ROOM;
  const spacing = 600 / (numPlayers - 1); // Spread across 200 to 800
  const x = 200 + playerIndex * spacing;
  
  // Add player to room
  rooms[roomId].players.push({
    id: playerId,
    name: playerName || `Player ${rooms[roomId].players.length + 1}`,
    score: 0,
    lives: 3,
    ready: false,
    position: {
      x: x,
      y: 550
    }
  });
  
  return { success: true };
}

/**
 * Player leaves a room
 * @param {string} playerId - Socket ID of leaving player
 * @returns {string[]} - Array of affected room IDs
 */
function leaveRoom(playerId) {
  const affectedRooms = [];
  
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    
    if (playerIndex >= 0) {
      // Remove player from room
      room.players.splice(playerIndex, 1);
      affectedRooms.push(roomId);
      
      // If room is empty, remove it
      if (room.players.length === 0) {
        delete rooms[roomId];
      } 
      // If host left, assign a new host
      else if (room.hostId === playerId && room.players.length > 0) {
        room.hostId = room.players[0].id;
      }
    }
  });
  
  return affectedRooms;
}

/**
 * Get data for a specific room
 * @param {string} roomId - Room ID
 * @returns {object|null} - Room data or null if not found
 */
function getRoomData(roomId) {
  return rooms[roomId] || null;
}

/**
 * Get all active rooms
 * @returns {object} - All rooms
 */
function getAllRooms() {
  // Return a simplified version for API use
  return Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: rooms[roomId].players.length,
    inProgress: rooms[roomId].gameInProgress,
    createdAt: rooms[roomId].createdAt
  }));
}

/**
 * Mark a player as ready/not ready
 * @param {string} roomId - Room ID
 * @param {string} playerId - Player ID
 * @param {boolean} isReady - Ready status
 * @returns {boolean} - Success
 */
function setPlayerReady(roomId, playerId, isReady) {
  if (!rooms[roomId]) return false;
  
  const player = rooms[roomId].players.find(p => p.id === playerId);
  if (!player) return false;
  
  player.ready = isReady;
  return true;
}

/**
 * Check if all players in a room are ready
 * @param {string} roomId - Room ID
 * @returns {boolean} - True if all players are ready
 */
function areAllPlayersReady(roomId) {
  if (!rooms[roomId]) return false;
  
  return rooms[roomId].players.length > 0 && 
         rooms[roomId].players.every(p => p.ready);
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomData,
  getAllRooms,
  setPlayerReady,
  areAllPlayersReady
}; 