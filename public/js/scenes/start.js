/**
 * StartScene - Main game scene (multiplayer version)
 */
class Start extends Phaser.Scene {
  constructor() {
    super('Start');
    this.DEBUG = false; // Set to true for debugging
  }

  init(data) {
    // Get data from the previous scene
    this.roomId = data.roomId;
    this.playerId = data.playerId;
    this.isHost = data.isHost;
  }

  preload() {
    // Set up loading error handler
    this.load.on('loaderror', (fileObj) => {
      console.error('Error loading asset:', fileObj.src);
      this.scene.start('MenuScene', { error: `Failed to load game assets. Please refresh the page.` });
    });
    
    // Load all the same assets as the single player version
    this.load.image('background', 'assets/space.png');
    this.load.image('heart', 'assets/heart.png');
    
    // Load the spaceship as a regular image, not a spritesheet
    this.load.image('ship', 'assets/spaceship.png');
    this.load.image('ship-red', 'assets/spaceshipred.png');
    
    // Load enemy sprites - both individual frames and spritesheets
    // Large jellyfish sprites
    this.load.spritesheet('jellyfish-large-sheet', 'assets/jellyfish-large-Sheet.png', {
        frameWidth: 32,  // Adjust these values based on the actual dimensions
        frameHeight: 32
    });
    this.load.image('jellyfish-large1', 'assets/jellyfish-large1.png');
    this.load.image('jellyfish-large2', 'assets/jellyfish-large2.png');
    this.load.image('jellyfish-large3', 'assets/jellyfish-large3.png');
    this.load.image('jellyfish-large4', 'assets/jellyfish-large4.png');
    
    // Medium jellyfish sprites
    this.load.spritesheet('jellyfish-medium-sheet', 'assets/jellyfish-medium-Sheet.png', {
        frameWidth: 24,  // Adjust these values based on the actual dimensions
        frameHeight: 24
    });
    this.load.image('jellyfish-medium1', 'assets/jellyfish-medium1.png');
    this.load.image('jellyfish-medium2', 'assets/jellyfish-medium2.png');
    
    // Tiny jellyfish sprites
    this.load.spritesheet('jellyfish-tiny-sheet', 'assets/jellyfish-tiny-Sheet.png', {
        frameWidth: 16,  // Adjust these values based on the actual dimensions
        frameHeight: 16
    });
    this.load.image('jellyfish-tiny1', 'assets/jellyfish-tiny1.png');
    this.load.image('jellyfish-tiny2', 'assets/jellyfish-tiny2.png');
    
    // Wasp as a spritesheet
    this.load.spritesheet('wasp-sheet', 'assets/wasp.png', {
        frameWidth: 37, frameHeight: 26
    });
    
    // Create a simple bullet sprite
    const graphics = this.make.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 4, 16);
    graphics.generateTexture('bullet', 4, 16);
    graphics.destroy();
    
    // Create an enemy bullet sprite (red)
    const enemyBulletGraphics = this.make.graphics();
    enemyBulletGraphics.fillStyle(0xff0000, 1);
    enemyBulletGraphics.fillRect(0, 0, 4, 16);
    enemyBulletGraphics.generateTexture('enemy-bullet', 4, 16);
    enemyBulletGraphics.destroy();
    
    // Create a barrier piece sprite (white)
    const barrierGraphics = this.make.graphics();
    barrierGraphics.fillStyle(0xffffff, 1);
    barrierGraphics.fillRect(0, 0, 8, 8);
    barrierGraphics.generateTexture('barrier-piece', 8, 8);
    barrierGraphics.destroy();
  }

  create() {
    // Game state flags
    this.gameOver = false;
    this.playerInvincible = false;

    // Create animations for enemies
    this.createAnimations();
    
    // Background
    this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // Initialize score and lives displays for all players
    this.createScoreboard();
    
    // Create player lives display
    this.createLivesDisplay();
    
    // Create game over text (initially hidden)
    this.createGameOverText();

    // Create containers for all game objects
    this.createObjectContainers();
    
    // Set up controls
    this.setupControls();
    
    // Set up socket event handlers
    this.setupSocketHandlers();
  }
  
  createAnimations() {
    // Create the same animations as in the single player version
    if (this.textures.exists('jellyfish-large-sheet')) {
      this.anims.create({
        key: 'jellyfish-large-anim',
        frames: this.anims.generateFrameNumbers('jellyfish-large-sheet', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }

    this.anims.create({
      key: 'jellyfish-large-frames',
      frames: [
        { key: 'jellyfish-large1' },
        { key: 'jellyfish-large2' },
        { key: 'jellyfish-large3' },
        { key: 'jellyfish-large4' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'jellyfish-medium-frames',
      frames: [
        { key: 'jellyfish-medium1' },
        { key: 'jellyfish-medium2' }
      ],
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'jellyfish-tiny-frames',
      frames: [
        { key: 'jellyfish-tiny1' },
        { key: 'jellyfish-tiny2' }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'wasp-anim',
      frames: this.anims.generateFrameNumbers('wasp-sheet', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1
    });
  }
  
  createScoreboard() {
    // Create a container for the scoreboard at the top of the screen
    this.scoreboard = this.add.container(0, 0);
    
    // Add a semi-transparent background for the scoreboard
    const scoreboardBg = this.add.rectangle(400, 30, 800, 60, 0x000000, 0.5);
    this.scoreboard.add(scoreboardBg);
    
    // We'll populate this in updateScoreboard based on players
    this.playerScores = {};
  }
  
  updateScoreboard(players) {
    // Clear existing score texts
    Object.values(this.playerScores).forEach(text => text.destroy());
    this.playerScores = {};
    
    // Create score texts for each player
    players.forEach((player, index) => {
      // Calculate position (evenly spread across the top)
      const xPos = 100 + (index * 200);
      
      // Create or update score text
      const scoreText = this.add.text(xPos, 30, `${player.name}: ${player.score}`, {
        fontFamily: '"Roboto", sans-serif',
        fontSize: '18px',
        color: player.id === this.playerId ? '#ffff00' : '#ffffff'
      }).setOrigin(0, 0.5);
      
      this.playerScores[player.id] = scoreText;
      this.scoreboard.add(scoreText);
    });
  }
  
  createLivesDisplay() {
    // Create a container for the lives display
    this.livesGroup = this.add.group();
    
    // We'll update this with player lives in updateLivesDisplay
  }
  
  updateLivesDisplay(currentPlayerLives) {
    // Clear existing lives display
    this.livesGroup.clear(true, true);
    
    // Add heart icons for remaining lives
    for (let i = 0; i < currentPlayerLives; i++) {
      const heart = this.livesGroup.create(16 + (i * 30), 70, 'heart');
      heart.setScale(0.5);
    }
  }
  
  createGameOverText() {
    this.gameOverText = this.add.text(400, 200, 'GAME OVER', {
      fontSize: '64px',
      fill: '#fff',
      fontFamily: '"Press Start 2P", cursive'
    }).setOrigin(0.5).setVisible(false);

    this.finalScoreText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: '"Roboto", sans-serif'
    }).setOrigin(0.5).setVisible(false);

    this.winnerText = this.add.text(400, 350, '', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: '"Orbitron", sans-serif'
    }).setOrigin(0.5).setVisible(false);

    this.backToLobbyText = this.add.text(400, 450, 'Back to Lobby', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: '"Press Start 2P", cursive',
      backgroundColor: '#222266',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.backToLobbyText.setStyle({ backgroundColor: '#3333aa' }))
      .on('pointerout', () => this.backToLobbyText.setStyle({ backgroundColor: '#222266' }))
      .on('pointerdown', () => this.scene.start('LobbyScene', {
        roomId: this.roomId,
        playerId: this.playerId,
        isHost: this.isHost
      }));
  }
  
  createObjectContainers() {
    // Create groups for players
    this.players = this.physics.add.group();
    
    // Create groups for bullets
    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    
    // Create groups for barriers
    this.barrierPieces = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });
    
    // Create groups for enemies
    this.enemies = this.physics.add.group();
  }
  
  setupControls() {
    // Set up controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  
  setupSocketHandlers() {
    // Handle game state updates from the server
    window.socketClient.onGameState = (state) => {
      if (!state) return;
      
      // Update players
      this.updatePlayers(state.players);
      
      // Update bullets
      this.updateBullets(state.bullets, this.bullets);
      this.updateBullets(state.enemyBullets, this.enemyBullets);
      
      // Update barriers
      this.updateBarriers(state.barriers);
      
      // Update enemies
      this.updateEnemies(state.enemies);
      
      // Handle hit effects
      if (state.hitEffects) {
        this.handleHitEffects(state.hitEffects);
      }
      
      // Handle explosions
      if (state.explosions) {
        this.handleExplosions(state.explosions);
      }
      
      // Update scores and lives
      this.updateScoreboard(state.players);
      
      // Update current player's lives
      const currentPlayer = state.players.find(p => p.id === this.playerId);
      if (currentPlayer) {
        this.updateLivesDisplay(currentPlayer.lives);
        this.playerInvincible = currentPlayer.invincible;
      }
      
      // Check for game over
      if (state.gameOver && !this.gameOver) {
        this.handleGameOver(state);
      }
    };
    
    // Handle game ending events
    window.socketClient.onGameEnded = (data) => {
      this.showFinalResults(data);
    };
    
    // Handle player leaving
    window.socketClient.onPlayerLeft = (data) => {
      // Remove the player's ship if they left
      const playerShip = this.players.getChildren().find(p => p.playerId === data.playerId);
      if (playerShip) {
        playerShip.destroy();
      }
    };
  }
  
  updatePlayers(serverPlayers) {
    const existingPlayers = this.players.getChildren();
    
    // Update existing players and create new ones
    serverPlayers.forEach(serverPlayer => {
      let playerSprite = existingPlayers.find(p => p.playerId === serverPlayer.id);
      
      if (!playerSprite) {
        // Create new player sprite
        playerSprite = this.physics.add.sprite(
          serverPlayer.position.x, 
          serverPlayer.position.y, 
          serverPlayer.id === this.playerId ? 'ship' : 'ship-red'
        );
        playerSprite.setScale(0.15);
        playerSprite.playerId = serverPlayer.id;
        playerSprite.isCurrentPlayer = serverPlayer.id === this.playerId;
        
        // Add to group
        this.players.add(playerSprite);
        
        if (this.DEBUG) console.log('Created player:', serverPlayer.id);
      }
      
      // Update position
      playerSprite.x = serverPlayer.position.x;
      playerSprite.y = serverPlayer.position.y;
      
      // Debug log
      if (this.DEBUG || true) {
        console.log(`[CLIENT] Player ${serverPlayer.id} pos:`, serverPlayer.position);
      }
      
      // Update visibility based on player invincibility
      if (serverPlayer.invincible) {
        playerSprite.alpha = 0.5;
      } else {
        playerSprite.alpha = 1;
      }
    });
    
    // Remove players that no longer exist
    existingPlayers.forEach(player => {
      if (!serverPlayers.some(p => p.id === player.playerId)) {
        player.destroy();
      }
    });
  }
  
  updateBullets(serverBullets, bulletGroup) {
    const existingBullets = bulletGroup.getChildren();
    
    // Update existing bullets and create new ones
    serverBullets.forEach(serverBullet => {
      let bulletSprite = existingBullets.find(b => b.bulletId === serverBullet.id);
      
      if (!bulletSprite) {
        // Create new bullet sprite
        bulletSprite = bulletGroup.create(
          serverBullet.position.x, 
          serverBullet.position.y, 
          bulletGroup === this.bullets ? 'bullet' : 'enemy-bullet'
        );
        bulletSprite.bulletId = serverBullet.id;
      }
      
      // Update position
      bulletSprite.x = serverBullet.position.x;
      bulletSprite.y = serverBullet.position.y;
    });
    
    // Remove bullets that no longer exist
    existingBullets.forEach(bullet => {
      if (!serverBullets.some(b => b.id === bullet.bulletId)) {
        bullet.destroy();
      }
    });
  }
  
  updateBarriers(serverBarriers) {
    const existingBarriers = this.barrierPieces.getChildren();
    
    // Update existing barriers and create new ones
    serverBarriers.forEach(serverBarrier => {
      let barrierSprite = existingBarriers.find(b => b.barrierId === serverBarrier.id);
      
      if (!barrierSprite) {
        // Create new barrier sprite
        barrierSprite = this.barrierPieces.create(
          serverBarrier.position.x, 
          serverBarrier.position.y, 
          'barrier-piece'
        );
        barrierSprite.barrierId = serverBarrier.id;
        barrierSprite.setImmovable(true);
        barrierSprite.setAlpha(1); // Start fully opaque
        barrierSprite._lastDurability = serverBarrier.durability;
      }
      // Only update alpha if durability changed
      if (barrierSprite._lastDurability !== serverBarrier.durability) {
        barrierSprite.setAlpha(serverBarrier.durability / 3);
        barrierSprite._lastDurability = serverBarrier.durability;
      }
    });
    
    // Remove barriers that no longer exist
    existingBarriers.forEach(barrier => {
      if (!serverBarriers.some(b => b.id === barrier.barrierId)) {
        barrier.destroy();
      }
    });
  }
  
  updateEnemies(serverEnemies) {
    const existingEnemies = this.enemies.getChildren();
    
    // Update existing enemies and create new ones
    serverEnemies.forEach(serverEnemy => {
      let enemySprite = existingEnemies.find(e => e.enemyId === serverEnemy.id);
      
      if (!enemySprite) {
        // Create new enemy sprite based on type
        let texture;
        let scale;
        let animKey;
        
        switch (serverEnemy.type) {
          case 'wasp':
            texture = 'wasp-sheet';
            scale = 1.5;
            animKey = 'wasp-anim';
            break;
          case 'jellyfish-large':
            texture = 'jellyfish-large1';
            scale = 2.0;
            animKey = 'jellyfish-large-frames';
            break;
          case 'jellyfish-medium':
            texture = 'jellyfish-medium1';
            scale = 1.7;
            animKey = 'jellyfish-medium-frames';
            break;
          case 'jellyfish-tiny':
            texture = 'jellyfish-tiny1';
            scale = 1.4;
            animKey = 'jellyfish-tiny-frames';
            break;
          default:
            texture = 'jellyfish-tiny1';
            scale = 1.0;
        }
        
        enemySprite = this.physics.add.sprite(
          serverEnemy.position.x, 
          serverEnemy.position.y, 
          texture
        );
        enemySprite.setScale(scale);
        enemySprite.enemyId = serverEnemy.id;
        enemySprite.enemyType = serverEnemy.type;
        
        // Add to group
        this.enemies.add(enemySprite);
        
        // Play animation
        if (animKey) {
          enemySprite.play(animKey);
        }
      }
      
      // Smoothly update position
      this.tweens.add({
        targets: enemySprite,
        x: serverEnemy.position.x,
        y: serverEnemy.position.y,
        duration: 16, // One frame at 60 FPS
        ease: 'Linear'
      });
    });
    
    // Remove enemies that no longer exist
    existingEnemies.forEach(enemy => {
      if (!serverEnemies.some(e => e.id === enemy.enemyId)) {
        // Create explosion effect when enemy is destroyed
        this.createExplosion(enemy.x, enemy.y);
        enemy.destroy();
      }
    });
  }
  
  update() {
    // Skip if game is over
    if (this.gameOver) return;
    
    // Background scrolling
    this.background.tilePositionY -= 0.5;
    
    // Previous input state to detect changes
    const prevInput = this._lastInput || {};
    
    // Handle player input with the same control scheme as singleplayer
    const input = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      fire: this.fireKey.isDown && !this.playerInvincible,
      // Add precise current time to allow server to calculate exact firing rate
      time: Date.now()
    };

    // Log when input changes
    if (input.left !== prevInput.left || input.right !== prevInput.right || input.fire !== prevInput.fire) {
      console.log('[INPUT] Keys pressed:', input);
    }
    
    // Save current input for next frame
    this._lastInput = {...input};
    
    // Send input to server
    window.socketClient.sendInput(input);
  }
  
  handleGameOver(state) {
    this.gameOver = true;
    
    // Show game over text
    this.gameOverText.setVisible(true);
    
    // Sort players by score (descending)
    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
    
    // Create final scores text
    let scoresText = '';
    sortedPlayers.forEach((player, index) => {
      scoresText += `${index + 1}. ${player.name}: ${player.score}\n`;
    });
    
    this.finalScoreText.setText(scoresText).setVisible(true);
    
    // Show winner text
    if (state.winner === 'players') {
      this.winnerText.setText('Players Win!').setVisible(true);
    } else {
      this.winnerText.setText('Enemies Win!').setVisible(true);
    }
    
    // Show back to lobby button
    this.backToLobbyText.setVisible(true);
  }
  
  showFinalResults(data) {
    // This method can be used to show more detailed results
    // when the server sends the final game_ended event
    console.log('Game ended with results:', data);
  }
  
  handleHitEffects(hitEffects) {
    hitEffects.forEach(effect => {
      switch (effect.type) {
        case 'flash':
          // Flash enemy
          const enemy = this.enemies.getChildren().find(e => e.enemyId === effect.targetId);
          if (enemy) {
            this.tweens.add({
              targets: enemy,
              alpha: 0.5,
              duration: effect.duration / 2,
              yoyo: true
            });
          }
          break;
          
        case 'barrier-hit':
          // Flash barrier
          const barrier = this.barrierPieces.getChildren().find(b => b.barrierId === effect.targetId);
          if (barrier) {
            this.tweens.add({
              targets: barrier,
              alpha: 0.5,
              duration: effect.duration / 2,
              yoyo: true
            });
          }
          break;
          
        case 'player-hit':
          // Flash player
          const player = this.players.getChildren().find(p => p.playerId === effect.targetId);
          if (player) {
            this.tweens.add({
              targets: player,
              alpha: 0.5,
              duration: effect.duration / 2,
              yoyo: true
            });
          }
          break;
      }
    });
  }
  
  handleExplosions(explosions) {
    explosions.forEach(explosion => {
      // Only create explosions we haven't seen before
      if (!this.processedExplosions || !this.processedExplosions.includes(explosion.id)) {
        this.createExplosion(explosion.position.x, explosion.position.y, explosion.type);
        
        // Track processed explosions
        this.processedExplosions = this.processedExplosions || [];
        this.processedExplosions.push(explosion.id);
      }
    });
    
    // Clean up old explosion IDs
    if (this.processedExplosions && this.processedExplosions.length > 100) {
      this.processedExplosions = this.processedExplosions.slice(-50);
    }
  }
  
  createExplosion(x, y, type = 'enemy') {
    // Create a particle explosion effect
    const emitter = this.add.particles(x, y, type === 'barrier' ? 'barrier-piece' : 'explosion', {
      speed: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 500,
      gravityY: 300,
      quantity: type === 'barrier' ? 8 : 15,
      emitting: false
    });
    
    // Emit all particles at once
    emitter.explode(type === 'barrier' ? 8 : 15);
    
    // Clean up after animation completes
    this.time.delayedCall(1000, () => {
      emitter.destroy();
    });
  }
} 