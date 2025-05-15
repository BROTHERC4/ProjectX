// Game state management for multiplayer
const { getRoomData, getAllRoomData } = require('./roomManager');

// Store game loop intervals for each room
const gameLoops = {};

// Game constants
const GAME_SPEED = 1000 / 60; // 60 FPS
const PLAYER_SPEED = 100; // Slower for multiplayer
const BULLET_SPEED = 400;
const ENEMY_SPEED = 35;
const ENEMY_BULLET_SPEED = 250;
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

/**
 * Handle player input and update player state
 * @param {string} playerId - Player socket ID
 * @param {object} input - Player input (left, right, fire)
 * @returns {string|null} - Room ID or null if player/room not found
 */
function handlePlayerInput(playerId, input) {
  // Find which room the player is in
  let playerRoom = null;
  let roomId = null;
  
  // Get all rooms - FIX: use getAllRoomData()
  const allRooms = getAllRoomData();
  if (!allRooms) {
    // No rooms exist, so ignore input (likely single player mode)
    console.log(`[GAMESTATE] No rooms exist for player ${playerId}`);
    return null;
  }
  
  // Search through all rooms to find the player
  let playerFound = false;
  Object.keys(allRooms).forEach(id => {
    const room = allRooms[id]; // FIX: Use allRooms directly instead of calling getRoomData again
    if (!room || !room.players) return;
    
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    
    if (playerIndex >= 0) {
      playerFound = true;
      playerRoom = room;
      roomId = id;
      console.log(`[GAMESTATE] Found player ${playerId} in room ${id}`);
    }
  });
  
  if (!playerFound) {
    console.log(`[GAMESTATE] Player ${playerId} not found in any room`);
    return null;
  }
  
  if (!playerRoom || !roomId || !playerRoom.gameInProgress) {
    console.log(`[GAMESTATE] Room ${roomId} not active or game not in progress`);
    return null;
  }
  
  const player = playerRoom.players.find(p => p.id === playerId);
  if (!player) {
    console.log(`[GAMESTATE] Player ${playerId} not found in room ${roomId} players list`);
    return null;
  }
  
  // Update player state based on input (will be applied in game loop)
  player.input = {...input}; // Make a copy to ensure reference is updated
  
  // Force immediate position update for testing
  if (playerRoom.gameState && playerRoom.gameState.players) {
    const gamePlayer = playerRoom.gameState.players.find(p => p.id === playerId);
    if (gamePlayer) {
      // Apply movement immediately for testing
      if (input.left) {
        gamePlayer.position.x -= 10;
        if (gamePlayer.position.x < 50) gamePlayer.position.x = 50;
      } else if (input.right) {
        gamePlayer.position.x += 10;
        if (gamePlayer.position.x > SCREEN_WIDTH - 50) gamePlayer.position.x = SCREEN_WIDTH - 50;
      }
      console.log(`[GAMESTATE] Updated player ${playerId} position:`, gamePlayer.position);
    } else {
      console.log(`[GAMESTATE] Player ${playerId} not found in gameState players list`);
    }
  }
  
  // Debug log
  if (process.env.DEBUG || true) {
    console.log(`[INPUT] Player ${playerId} in room ${roomId} input:`, input);
  }
  
  return roomId;
}

/**
 * Start a game in a specific room
 * @param {string} roomId - Room ID
 * @param {object} io - Socket.io instance
 */
function startGameInRoom(roomId, io) {
  const room = getRoomData(roomId);
  if (!room || room.gameInProgress) return;
  
  // Initialize game state
  room.gameInProgress = true;
  room.gameState = {
    players: room.players.map(player => ({
      id: player.id,
      position: player.position,
      lives: 3,
      score: 0,
      invincible: false
    })),
    bullets: [],
    enemyBullets: [],
    enemies: initializeEnemies(),
    barriers: initializeBarriers(),
    lastEnemyShot: Date.now(),
    enemyDirection: 1,
    gameOver: false,
    winner: null,
    timestamp: Date.now()
  };
  
  // Reset player scores and lives
  room.players.forEach(player => {
    player.score = 0;
    player.lives = 3;
  });
  
  // Create a game loop for this room
  gameLoops[roomId] = setInterval(() => {
    updateGameState(roomId, io);
  }, GAME_SPEED);
}

/**
 * End a game in a specific room
 * @param {string} roomId - Room ID
 */
function endGameInRoom(roomId) {
  if (gameLoops[roomId]) {
    clearInterval(gameLoops[roomId]);
    delete gameLoops[roomId];
  }
  
  const room = getRoomData(roomId);
  if (room) {
    room.gameInProgress = false;
    room.gameState = null;
    
    // Reset player ready status
    room.players.forEach(player => {
      player.ready = false;
    });
  }
}

/**
 * Initialize enemy positions and state
 * @returns {array} - Array of enemy objects
 */
function initializeEnemies() {
  const enemies = [];
  
  // Wasp row (top row)
  for (let i = 0; i < 8; i++) {
    enemies.push({
      id: `wasp-${i}`,
      type: 'wasp',
      position: { x: 100 + i * 80, y: 80 },
      originalPosition: { x: 100 + i * 80, y: 80 },
      health: 1,
      points: 50,
      movePattern: 'zigzag',
      moveTimer: i * 100,
      lastShot: 0
    });
  }
  
  // Large jellyfish row (second row)
  for (let i = 0; i < 8; i++) {
    enemies.push({
      id: `jellyfish-large-${i}`,
      type: 'jellyfish-large',
      position: { x: 100 + i * 80, y: 150 },
      originalPosition: { x: 100 + i * 80, y: 150 },
      health: 3,
      points: 30,
      movePattern: 'sineWave',
      moveTimer: i * 100
    });
  }
  
  // Medium jellyfish row (third row)
  for (let i = 0; i < 8; i++) {
    enemies.push({
      id: `jellyfish-medium-${i}`,
      type: 'jellyfish-medium',
      position: { x: 100 + i * 80, y: 220 },
      originalPosition: { x: 100 + i * 80, y: 220 },
      health: 2,
      points: 20,
      movePattern: 'standard'
    });
  }
  
  // Tiny jellyfish row (bottom row)
  for (let i = 0; i < 8; i++) {
    enemies.push({
      id: `jellyfish-tiny-${i}`,
      type: 'jellyfish-tiny',
      position: { x: 100 + i * 80, y: 290 },
      originalPosition: { x: 100 + i * 80, y: 290 },
      health: 1,
      points: 10,
      movePattern: 'swooping',
      moveTimer: i * 150
    });
  }
  
  return enemies;
}

/**
 * Initialize barrier positions and state
 * @returns {array} - Array of barrier piece objects
 */
function initializeBarriers() {
  const barriers = [];
  
  // Define the shape of a barrier using a 2D array
  const barrierShape = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1]
  ];
  
  // Calculate evenly spaced positions for barriers
  const numBarriers = 4;
  const spacing = SCREEN_WIDTH / (numBarriers + 1);
  const pieceSize = 8;
  
  // Create barriers at evenly spaced positions
  for (let b = 1; b <= numBarriers; b++) {
    const xPos = spacing * b;
    const yPos = 450;
    
    for (let row = 0; row < barrierShape.length; row++) {
      for (let col = 0; col < barrierShape[row].length; col++) {
        if (barrierShape[row][col] === 1) {
          const x = xPos + (col * pieceSize) - (barrierShape[row].length * pieceSize / 2);
          const y = yPos + (row * pieceSize);
          
          barriers.push({
            id: `barrier-${b}-${row}-${col}`,
            position: { x, y },
            width: pieceSize,
            height: pieceSize,
            durability: Math.floor(Math.random() * 3) + 1
          });
        }
      }
    }
  }
  
  return barriers;
}

/**
 * Update the game state for a specific room
 * @param {string} roomId - Room ID
 * @param {object} io - Socket.io instance
 */
function updateGameState(roomId, io) {
  const room = getRoomData(roomId);
  if (!room || !room.gameInProgress || !room.gameState) return;
  
  let deltaTime = Date.now() - room.gameState.timestamp;
  // Clamp deltaTime to prevent movement spikes (16ms = 60 FPS, 34ms = ~30 FPS)
  deltaTime = Math.max(16, Math.min(deltaTime, 34));
  const gameState = room.gameState;
  
  // Skip update if game is over
  if (gameState.gameOver) {
    io.to(roomId).emit('game_state', gameState);
    return;
  }
  
  // Update players based on input
  updatePlayers(gameState, room.players, deltaTime);
  
  // Update bullets
  updateBullets(gameState, deltaTime);
  
  // Update enemies
  updateEnemies(gameState, deltaTime);
  
  // Handle enemy shooting
  handleEnemyShooting(gameState);
  
  // Check collisions
  checkCollisions(gameState, room);
  
  // Check win/lose conditions
  checkGameEnd(gameState, room);
  
  // Update timestamp
  gameState.timestamp = Date.now();
  
  // Send updated state to all clients in the room
  io.to(roomId).emit('game_state', gameState);
  
  // If game is over, set timeout to end the game after 5 seconds
  if (gameState.gameOver) {
    setTimeout(() => {
      endGameInRoom(roomId);
      io.to(roomId).emit('game_ended', {
        winner: gameState.winner,
        finalScores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
    }, 5000);
  }
}

/**
 * Update player positions based on input
 * @param {object} gameState - Current game state
 * @param {array} players - Array of player objects
 * @param {number} deltaTime - Time since last update
 */
function updatePlayers(gameState, players, deltaTime) {
  players.forEach(player => {
    if (!player.input) {
      console.log(`[GAMESTATE] Player ${player.id} has no input`);
      return;
    }
    
    const gamePlayer = gameState.players.find(p => p.id === player.id);
    if (!gamePlayer) {
      console.log(`[GAMESTATE] Player ${player.id} not found in gameState`);
      return;
    }
    
    // Store original position for comparison
    const origX = gamePlayer.position.x;
    
    // Move based on input with the SAME speed as singleplayer
    if (player.input.left) {
      gamePlayer.position.x -= PLAYER_SPEED * (deltaTime / 1000);
      if (gamePlayer.position.x < 50) gamePlayer.position.x = 50;
    } else if (player.input.right) {
      gamePlayer.position.x += PLAYER_SPEED * (deltaTime / 1000);
      if (gamePlayer.position.x > SCREEN_WIDTH - 50) gamePlayer.position.x = SCREEN_WIDTH - 50;
    }
    
    // Log position change if it moved
    if (origX !== gamePlayer.position.x) {
      console.log(`[GAMESTATE] Player ${player.id} moved from ${origX} to ${gamePlayer.position.x}`);
    }
    
    // Handle shooting with the SAME fire rate as singleplayer (200ms)
    if (player.input.fire && !gamePlayer.invincible) {
      const now = player.input.time || Date.now();
      if (!player.lastShot || now - player.lastShot > 200) {
        player.lastShot = now;
        gameState.bullets.push({
          id: `bullet-${player.id}-${now}`,
          position: { x: gamePlayer.position.x, y: gamePlayer.position.y - 30 },
          velocity: { x: 0, y: -BULLET_SPEED },
          playerId: player.id
        });
        console.log(`[GAMESTATE] Player ${player.id} fired bullet`);
      }
    }
    
    // Debug log
    if (process.env.DEBUG || true) {
      console.log(`[UPDATE] Player ${player.id} pos:`, gamePlayer.position);
    }
  });
}

/**
 * Update all bullets positions
 * @param {object} gameState - Current game state
 * @param {number} deltaTime - Time since last update
 */
function updateBullets(gameState, deltaTime) {
  // Move player bullets
  gameState.bullets = gameState.bullets.filter(bullet => {
    bullet.position.x += bullet.velocity.x * (deltaTime / 1000);
    bullet.position.y += bullet.velocity.y * (deltaTime / 1000);
    
    // Remove bullets that are out of bounds
    return bullet.position.y > 0 && bullet.position.y < SCREEN_HEIGHT;
  });
  
  // Move enemy bullets
  gameState.enemyBullets = gameState.enemyBullets.filter(bullet => {
    bullet.position.x += bullet.velocity.x * (deltaTime / 1000);
    bullet.position.y += bullet.velocity.y * (deltaTime / 1000);
    
    // Remove bullets that are out of bounds
    return bullet.position.y > 0 && bullet.position.y < SCREEN_HEIGHT;
  });
}

/**
 * Update enemy positions
 * @param {object} gameState - Current game state
 * @param {number} deltaTime - Time since last update
 */
function updateEnemies(gameState, deltaTime) {
  // Check if enemies need to change direction
  let moveDown = false;
  gameState.enemies.forEach(enemy => {
    if ((enemy.position.x < 50 && gameState.enemyDirection < 0) || 
        (enemy.position.x > SCREEN_WIDTH - 50 && gameState.enemyDirection > 0)) {
      moveDown = true;
    }
  });
  
  // Change direction and move down if needed
  if (moveDown) {
    gameState.enemyDirection *= -1;
    gameState.enemies.forEach(enemy => {
      enemy.position.y += 5;
    });
  }
  
  // Move enemies based on their pattern
  gameState.enemies.forEach(enemy => {
    // Base horizontal movement
    enemy.position.x += ENEMY_SPEED * (deltaTime / 1000) * gameState.enemyDirection;
    
    // Add unique movement patterns matching singleplayer
    switch(enemy.movePattern) {
      case 'zigzag':
        enemy.moveTimer += deltaTime;
        enemy.position.y = enemy.originalPosition.y + Math.sin(enemy.moveTimer / 300) * 15;
        break;
      case 'sineWave':
        enemy.moveTimer += deltaTime;
        // Add slight wave motion to large jellyfish
        enemy.position.x += Math.sin(enemy.moveTimer / 1000) * 0.5;
        enemy.position.y += 0.002 * deltaTime; // Slow descent
        break;
      case 'standard':
        // Medium jellyfish - standard movement
        enemy.position.y += 0.002 * deltaTime; // Slow descent
        break;
      case 'swooping':
        enemy.moveTimer += deltaTime;
        // Add swooping motion to tiny jellyfish
        if (enemy.moveTimer % 5000 < 2500) {
          enemy.position.y += 0.005 * deltaTime; // Faster descent during swoop
        } else {
          enemy.position.y += 0.001 * deltaTime; // Slower descent after swoop
        }
        break;
    }
  });
}

/**
 * Handle enemy shooting logic
 * @param {object} gameState - Current game state
 */
function handleEnemyShooting(gameState) {
  const now = Date.now();
  
  // Only allow enemy shots every 500ms
  if (now - gameState.lastEnemyShot < 500) return;
  
  // Find enemies that can shoot (only wasps)
  const shootingEnemies = gameState.enemies.filter(enemy => enemy.type === 'wasp');
  
  // Randomly select an enemy to shoot (if any)
  if (shootingEnemies.length > 0 && Math.random() < 0.1) {
    const shooter = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
    
    // Create a new enemy bullet
    gameState.enemyBullets.push({
      id: `enemy-bullet-${shooter.id}-${now}`,
      position: { x: shooter.position.x, y: shooter.position.y + 20 },
      velocity: { x: 0, y: ENEMY_BULLET_SPEED },
      enemyId: shooter.id
    });
    
    gameState.lastEnemyShot = now;
  }
}

/**
 * Check all collisions
 * @param {object} gameState - Current game state
 * @param {object} room - Room object
 */
function checkCollisions(gameState, room) {
  // Player bullets vs enemies - make more precise like singleplayer
  gameState.bullets = gameState.bullets.filter(bullet => {
    let hit = false;
    
    gameState.enemies.forEach(enemy => {
      // Use more precise collision detection with appropriate hitbox sizes
      const hitboxSize = enemy.type === 'wasp' ? 25 : 
                        enemy.type === 'jellyfish-large' ? 30 :
                        enemy.type === 'jellyfish-medium' ? 20 : 15;
                        
      if (distance(bullet.position, enemy.position) < hitboxSize) {
        // Enemy hit
        enemy.health--;
        hit = true;
        
        // Flash the enemy visually - send event to clients
        gameState.hitEffects = gameState.hitEffects || [];
        gameState.hitEffects.push({
          id: `hit-${Date.now()}-${enemy.id}`,
          targetId: enemy.id,
          type: 'flash',
          duration: 100
        });
        
        // If enemy defeated
        if (enemy.health <= 0) {
          // Find player who shot bullet
          const player = room.players.find(p => p.id === bullet.playerId);
          if (player) {
            // Award points
            player.score += enemy.points;
            
            // Update score in gameState
            const gamePlayer = gameState.players.find(p => p.id === player.id);
            if (gamePlayer) {
              gamePlayer.score = player.score;
            }
          }
          
          // Create explosion effect
          gameState.explosions = gameState.explosions || [];
          gameState.explosions.push({
            id: `explosion-${Date.now()}`,
            position: {...enemy.position},
            timeLeft: 500
          });
          
          // Remove enemy
          gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
        }
      }
    });
    
    // Keep bullet if it didn't hit anything
    return !hit;
  });
  
  // Enemy bullets vs barriers - more precise collision
  gameState.enemyBullets = gameState.enemyBullets.filter(bullet => {
    let hit = false;
    
    gameState.barriers.forEach(barrier => {
      if (distance(bullet.position, barrier.position) < 8) {
        barrier.durability--;
        hit = true;
        
        // Create barrier hit effect
        gameState.hitEffects = gameState.hitEffects || [];
        gameState.hitEffects.push({
          id: `hit-${Date.now()}-${barrier.id}`,
          targetId: barrier.id,
          type: 'barrier-hit',
          duration: 100
        });
        
        // Remove barrier if destroyed
        if (barrier.durability <= 0) {
          gameState.barriers = gameState.barriers.filter(b => b.id !== barrier.id);
          
          // Create barrier destruction effect
          gameState.explosions = gameState.explosions || [];
          gameState.explosions.push({
            id: `explosion-${Date.now()}`,
            position: {...barrier.position},
            type: 'barrier',
            timeLeft: 500
          });
        }
      }
    });
    
    // Keep bullet if it didn't hit anything
    return !hit;
  });
  
  // Enemy bullets vs players - more precise collision
  gameState.enemyBullets = gameState.enemyBullets.filter(bullet => {
    let hit = false;
    
    gameState.players.forEach(player => {
      // Skip if player is invincible
      if (player.invincible) return;
      
      // Use player-specific hitbox size
      const hitboxSize = 20;
      
      // Check collision
      if (distance(bullet.position, player.position) < hitboxSize) {
        hit = true;
        player.lives--;
        
        // Update lives in room state
        const roomPlayer = room.players.find(p => p.id === player.id);
        if (roomPlayer) {
          roomPlayer.lives = player.lives;
        }
        
        // Create player hit effect
        gameState.hitEffects = gameState.hitEffects || [];
        gameState.hitEffects.push({
          id: `hit-${Date.now()}-${player.id}`,
          targetId: player.id,
          type: 'player-hit',
          duration: 100
        });
        
        // Make player invincible
        player.invincible = true;
        
        // Reset invincibility after 2 seconds
        setTimeout(() => {
          const updatedPlayer = gameState.players.find(p => p.id === player.id);
          if (updatedPlayer) {
            updatedPlayer.invincible = false;
          }
        }, 2000);
      }
    });
    
    // Keep bullet if it didn't hit anything
    return !hit;
  });
}

/**
 * Check if the game should end
 * @param {object} gameState - Current game state
 * @param {object} room - Room object
 */
function checkGameEnd(gameState, room) {
  // Check if all enemies are defeated
  if (gameState.enemies.length === 0) {
    gameState.gameOver = true;
    gameState.winner = 'players';
    return;
  }
  
  // Check if all players are out of lives
  const allPlayersDead = gameState.players.every(player => player.lives <= 0);
  if (allPlayersDead) {
    gameState.gameOver = true;
    gameState.winner = 'enemies';
    return;
  }
  
  // Check if enemies reached the bottom of the screen
  const enemyReachedBottom = gameState.enemies.some(enemy => enemy.position.y > 500);
  if (enemyReachedBottom) {
    gameState.gameOver = true;
    gameState.winner = 'enemies';
    return;
  }
}

/**
 * Calculate distance between two points
 * @param {object} point1 - First point {x, y}
 * @param {object} point2 - Second point {x, y}
 * @returns {number} - Distance
 */
function distance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

module.exports = {
  handlePlayerInput,
  startGameInRoom,
  endGameInRoom
}; 