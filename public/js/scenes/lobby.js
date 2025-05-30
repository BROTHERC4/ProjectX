/**
 * Lobby Scene - Where players wait before starting the game
 */
class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  init(data) {
    // Get data passed from MenuScene
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

    // Load background images using background manager
    if (window.backgroundManager) {
      window.backgroundManager.preloadBackgrounds(this);
    } else {
      // Fallback if background manager is not available
      this.load.image('background', 'assets/space.png');
    }
    
    this.load.image('ship', 'assets/spaceship.png');
    this.load.image('ship-red', 'assets/spaceshipred.png');
  }

  create() {
    // Background using background manager
    if (window.backgroundManager) {
      this.background = window.backgroundManager.createBackground(this);
    } else {
      // Fallback if background manager is not available
      this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
    }
    
    // Title text
    this.add.text(400, 50, 'Game Lobby', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 36,
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Room code text
    this.add.text(400, 100, `Room Code: ${this.roomId}`, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 24,
      color: '#ffff00'
    }).setOrigin(0.5);
    
    // Players list title
    this.add.text(400, 150, 'Players', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 24,
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Container for player list
    this.playerListContainer = this.add.container(400, 250);
    
    // Create ready button
    const readyButtonText = 'Ready';
    this.readyButton = this.add.text(400, 450, readyButtonText, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 22,
      backgroundColor: '#222266',
      color: '#ffffff',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.readyButton.setStyle({ backgroundColor: '#3333aa' }))
      .on('pointerout', () => this.readyButton.setStyle({ backgroundColor: '#222266' }))
      .on('pointerdown', () => this.toggleReady());
    
    // Only the host can start the game
    if (this.isHost) {
      this.startButton = this.add.text(400, 520, 'Start Game', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: 22,
        backgroundColor: '#662222',
        color: '#ffffff',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.startButton.setStyle({ backgroundColor: '#aa3333' }))
        .on('pointerout', () => this.startButton.setStyle({ backgroundColor: '#662222' }))
        .on('pointerdown', () => this.startGame());
    }
    
    // Status text (for error messages or notifications)
    this.statusText = this.add.text(400, 570, '', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 18,
      color: '#ff0000'
    }).setOrigin(0.5);
    
    // Setup socket event handlers
    this.setupSocketHandlers();
    
    // Keep track of ready state
    this.isReady = false;

    // Force an initial update with current players
    if (window.socketClient.players && window.socketClient.players.length > 0) {
      // Comment out all console.log statements.
      // console.log("Initializing player list with existing players:", window.socketClient.players);
      this.updatePlayerList(window.socketClient.players);
    }
  }
  
  setupSocketHandlers() {
    // Set up socket event handlers
    window.socketClient.onRoomUpdated = (data) => {
      this.updatePlayerList(data.players);
      
      // Check if all players are ready
      const allReady = data.players.every(player => player.ready);
      const enoughPlayers = data.players.length >= 1; // For testing, allow 1 player
      
      // Only enable start button if everyone is ready and there are enough players
      if (this.startButton) {
        if (allReady && enoughPlayers) {
          this.startButton.setStyle({ backgroundColor: '#227722' });
          this.startButton.setInteractive({ useHandCursor: true });
        } else {
          this.startButton.setStyle({ backgroundColor: '#662222' });
          this.startButton.disableInteractive();
        }
      }
    };
    
    window.socketClient.onGameStarted = () => {
      this.scene.start('Start', {
        roomId: this.roomId,
        playerId: this.playerId,
        isHost: this.isHost
      });
    };
    
    window.socketClient.onPlayerLeft = (data) => {
      this.showStatus(`Player has left the game`, 3000);
    };
    
    window.socketClient.onError = (message) => {
      this.showStatus(message, 3000);
    };
  }
  
  updatePlayerList(players) {
    // Clear existing player list
    this.playerListContainer.removeAll();
    
    // Create a list of player entries
    players.forEach((player, index) => {
      const yPos = index * 50;
      
      // Player ship icon
      const shipIcon = this.add.image(-150, yPos, player.id === this.playerId ? 'ship' : 'ship-red')
        .setOrigin(0.5)
        .setScale(0.1);
      
      // Player name
      const nameText = this.add.text(-100, yPos, player.name, {
        fontFamily: '"Roboto", sans-serif',
        fontSize: 18,
        color: player.id === this.playerId ? '#ffff00' : '#ffffff'
      }).setOrigin(0, 0.5);
      
      // Host indicator - use this.isHost and this.playerId
      let hostText = null;
      if (player.id === this.playerId && this.isHost) {
        hostText = this.add.text(40, yPos, 'HOST', {
          fontFamily: '"Roboto", sans-serif',
          fontSize: 14,
          color: '#ff9900'
        }).setOrigin(0, 0.5);
      }
      
      // Ready status
      const readyText = this.add.text(120, yPos, player.ready ? 'READY' : 'NOT READY', {
        fontFamily: '"Roboto", sans-serif',
        fontSize: 16,
        color: player.ready ? '#00ff00' : '#ff0000'
      }).setOrigin(0, 0.5);
      
      // Add all elements to container
      this.playerListContainer.add([shipIcon, nameText, readyText]);
      if (hostText) {
        this.playerListContainer.add(hostText);
      }
    });
    // Log for debugging
    // console.log(`Updated player list with ${players.length} players`);
  }
  
  toggleReady() {
    this.isReady = !this.isReady;
    
    // Update button text and style
    if (this.isReady) {
      this.readyButton.setText('Cancel Ready');
      this.readyButton.setStyle({ backgroundColor: '#227722' });
    } else {
      this.readyButton.setText('Ready');
      this.readyButton.setStyle({ backgroundColor: '#222266' });
    }
    
    // Send ready status to server
    window.socketClient.setReady(this.isReady);
  }
  
  startGame() {
    // Only host can start the game
    if (this.isHost) {
      window.socketClient.startGame();
    }
  }
  
  showStatus(message, duration = 3000) {
    this.statusText.setText(message);
    
    // Clear after specified duration
    this.time.delayedCall(duration, () => {
      this.statusText.setText('');
    });
  }
  
  update() {
    // Animation for background
    const bgSprite = this.children.list.find(child => child.type === 'TileSprite');
    if (bgSprite) {
      bgSprite.tilePositionY -= 0.2;
    }
  }
} 