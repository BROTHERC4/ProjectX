/**
 * Game Over Scene - Shown when the game ends
 */
class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    // Get data from the previous scene
    this.roomId = data.roomId;
    this.playerId = data.playerId;
    this.isHost = data.isHost;
    this.finalScores = data.finalScores || [];
    this.winner = data.winner || 'unknown';
  }

  preload() {
    // Set up loading error handler
    this.load.on('loaderror', (fileObj) => {
      if (typeof debugLog !== 'undefined') {
        debugLog('Error loading asset in GameOverScene: ' + fileObj.src);
      }
      console.error('Error loading asset:', fileObj.src);
      this.scene.start('MenuScene', { error: `Failed to load game asset: ${fileObj.key}` });
    });
    
    // Load background images using background manager
    if (window.backgroundManager) {
      window.backgroundManager.preloadBackgrounds(this);
    } else {
      // Fallback if background manager is not available
      this.load.image('background', 'assets/space.png');
    }
  }

  create() {
    // Add background using background manager
    if (window.backgroundManager) {
      this.background = window.backgroundManager.createBackground(this);
    } else {
      // Fallback if background manager is not available
      this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
    }
    
    // Game over title
    this.add.text(400, 100, 'GAME OVER', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 48,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
    }).setOrigin(0.5);
    
    // Winner text
    let winnerText = 'The game has ended!';
    if (this.winner === 'players') {
      winnerText = 'Players Win!';
    } else if (this.winner === 'enemies') {
      winnerText = 'Enemies Win!';
    }
    
    this.add.text(400, 180, winnerText, {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 32,
      color: '#ffff00'
    }).setOrigin(0.5);
    
    // Final scores heading
    this.add.text(400, 240, 'Final Scores', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 28,
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Display final scores
    const sortedScores = [...this.finalScores].sort((a, b) => b.score - a.score);
    
    sortedScores.forEach((player, index) => {
      const yPos = 300 + (index * 40);
      const color = player.id === this.playerId ? '#ffff00' : '#ffffff';
      
      this.add.text(400, yPos, `${index + 1}. ${player.name}: ${player.score}`, {
        fontFamily: '"Roboto", sans-serif',
        fontSize: 24,
        color: color
      }).setOrigin(0.5);
    });
    
    // Create buttons
    const buttonStyle = {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 20,
      color: '#ffffff',
      backgroundColor: '#222266',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    };
    
    // Back to lobby button
    const lobbyButton = this.add.text(400, 500, 'Back to Lobby', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => lobbyButton.setStyle({ backgroundColor: '#3333aa' }))
      .on('pointerout', () => lobbyButton.setStyle({ backgroundColor: '#222266' }))
      .on('pointerup', () => {
        this.scene.start('LobbyScene', {
          roomId: this.roomId,
          playerId: this.playerId,
          isHost: this.isHost
        });
      });
    
    // Main menu button
    const menuButton = this.add.text(400, 550, 'Main Menu', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuButton.setStyle({ backgroundColor: '#3333aa' }))
      .on('pointerout', () => menuButton.setStyle({ backgroundColor: '#222266' }))
      .on('pointerup', () => {
        window.socketClient.leaveRoom();
        this.scene.start('MenuScene');
      });
  }
  
  update() {
    // Animate background
    const bgSprite = this.children.list.find(child => child.type === 'TileSprite');
    if (bgSprite) {
      bgSprite.tilePositionY -= 0.5;
    }
  }
} 