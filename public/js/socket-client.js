/**
 * Socket.io client for multiplayer game
 */
class SocketClient {
  constructor() {
    // Connect to the Socket.io server
    this.socket = io();
    
    // Player and room info
    this.playerId = null;
    this.playerName = null;
    this.roomId = null;
    this.isHost = false;
    
    // Game state
    this.gameState = null;
    this.players = [];
    
    // Event handlers
    this.onRoomCreated = null;
    this.onRoomJoined = null;
    this.onRoomUpdated = null;
    this.onGameStarted = null;
    this.onGameState = null;
    this.onGameEnded = null;
    this.onPlayerLeft = null;
    this.onError = null;
    
    // Set up socket event listeners
    this.setupSocketListeners();
  }
  
  /**
   * Set up socket event listeners
   */
  setupSocketListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
      this.playerId = this.socket.id;
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    // Room events
    this.socket.on('room_created', (data) => {
      console.log('Room created:', data);
      this.roomId = data.roomId;
      this.isHost = true;
      
      if (this.onRoomCreated) {
        this.onRoomCreated(data);
      }
    });
    
    this.socket.on('room_joined', (data) => {
      console.log('Room joined:', data);
      this.roomId = data.roomId;
      
      if (this.onRoomJoined) {
        this.onRoomJoined(data);
      }
    });
    
    this.socket.on('room_update', (data) => {
      console.log('Room update:', data);
      this.players = data.players;
      
      if (this.onRoomUpdated) {
        this.onRoomUpdated(data);
      }
    });
    
    // Game events
    this.socket.on('game_started', () => {
      console.log('Game started');
      
      if (this.onGameStarted) {
        this.onGameStarted();
      }
    });
    
    this.socket.on('game_state', (state) => {
      // Store the latest game state
      this.gameState = state;
      
      if (this.onGameState) {
        this.onGameState(state);
      }
    });
    
    this.socket.on('game_ended', (data) => {
      console.log('Game ended:', data);
      
      if (this.onGameEnded) {
        this.onGameEnded(data);
      }
    });
    
    this.socket.on('player_left', (data) => {
      console.log('Player left:', data);
      
      if (this.onPlayerLeft) {
        this.onPlayerLeft(data);
      }
    });
    
    // Error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data.message);
      
      if (this.onError) {
        this.onError(data.message);
      }
    });
  }
  
  /**
   * Create a new game room
   * @param {string} playerName - Player name
   */
  createRoom(playerName) {
    this.playerName = playerName;
    this.socket.emit('create_room', playerName);
  }
  
  /**
   * Join an existing game room
   * @param {string} roomId - Room ID to join
   * @param {string} playerName - Player name
   */
  joinRoom(roomId, playerName) {
    this.playerName = playerName;
    this.socket.emit('join_room', { roomId, playerName });
  }
  
  /**
   * Start the game (host only)
   */
  startGame() {
    if (this.isHost && this.roomId) {
      this.socket.emit('start_game', this.roomId);
    } else {
      console.error('Only the host can start the game');
    }
  }
  
  /**
   * Send player input to the server
   * @param {object} input - Input object (left, right, fire)
   */
  sendInput(input) {
    this.socket.emit('player_input', input);
  }
  
  /**
   * Set player ready status
   * @param {boolean} isReady - Ready status
   */
  setReady(isReady) {
    this.socket.emit('player_ready', { 
      roomId: this.roomId,
      ready: isReady 
    });
  }
  
  /**
   * Leave the current room
   */
  leaveRoom() {
    this.socket.emit('leave_room');
    this.roomId = null;
    this.isHost = false;
  }
  
  /**
   * Get the current player
   * @returns {object|null} - Player object or null
   */
  getCurrentPlayer() {
    if (!this.gameState || !this.playerId) return null;
    
    return this.gameState.players.find(p => p.id === this.playerId);
  }
}

// Export for use in Phaser scenes
window.SocketClient = SocketClient; 