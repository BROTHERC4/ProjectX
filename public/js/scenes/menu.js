/**
 * Menu Scene - First screen of the game
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  init(data) {
    // Check if there's an error passed from another scene
    this.errorMessage = data ? data.error : null;
  }

  preload() {
    // Set up loading error handler
    this.load.on('loaderror', (fileObj) => {
      if (typeof debugLog !== 'undefined') {
        debugLog('Error loading asset in MenuScene: ' + fileObj.src);
      }
      console.error('Error loading asset:', fileObj.src);
      this.errorMessage = `Failed to load game asset: ${fileObj.key}`;
    });

    // Load background images using background manager
    if (window.backgroundManager) {
      window.backgroundManager.preloadBackgrounds(this);
    } else {
      // Fallback if background manager is not available
      this.load.image('background', 'assets/space.png');
    }
    
    this.load.image('logo', 'assets/logo.png');
    
    // Load Google Fonts using WebFont Loader
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    // Wait for WebFont to load before creating menu UI
    if (window.WebFont) {
      window.WebFont.load({
        google: {
          families: ['Orbitron:400,700', 'Press Start 2P', 'Roboto:400,700']
        },
        active: () => {
          this.createMenuUI();
        }
      });
    } else {
      // Fallback: create menu UI immediately if WebFont is not available
      this.createMenuUI();
    }
  }
  
  createMenuUI() {
    // Add background using background manager
    if (window.backgroundManager) {
      this.background = window.backgroundManager.createBackground(this);
    } else {
      // Fallback if background manager is not available
      this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
    }
    
    // Add logo or title
    const title = this.add.text(400, 100, 'ProjectX', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 48,
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
    }).setOrigin(0.5);
    
    // Create main menu container
    const menuContainer = this.add.container(400, 300);
    
    // Create buttons
    const buttonStyle = {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 24,
      color: '#ffffff',
      backgroundColor: '#222266',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    };
    
    // Create game button
    const createButton = this.add.text(0, -60, 'Create Game', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.buttonHover(createButton))
      .on('pointerout', () => this.buttonOut(createButton))
      .on('pointerdown', () => this.showCreateGame());
    
    // Join game button
    const joinButton = this.add.text(0, 0, 'Join Game', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.buttonHover(joinButton))
      .on('pointerout', () => this.buttonOut(joinButton))
      .on('pointerdown', () => this.showJoinGame());
    
    // Single player button
    const singlePlayerButton = this.add.text(0, 60, 'Single Player', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.buttonHover(singlePlayerButton))
      .on('pointerout', () => this.buttonOut(singlePlayerButton))
      .on('pointerdown', () => this.startSinglePlayer());
    
    // Credits button
    const creditsButton = this.add.text(0, 120, 'Credits', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.buttonHover(creditsButton))
      .on('pointerout', () => this.buttonOut(creditsButton))
      .on('pointerdown', () => this.scene.start('CreditsScene'));
    
    // Add buttons to container
    menuContainer.add([createButton, joinButton, singlePlayerButton, creditsButton]);
    
    // Create form containers (initially hidden)
    this.createFormContainer = this.createForm('Create Game');
    this.createFormContainer.setVisible(false);
    
    this.joinFormContainer = this.createJoinForm();
    this.joinFormContainer.setVisible(false);
    
    // Add main menu to the scene
    this.add.existing(menuContainer);
    this.menuContainer = menuContainer;
    
    // Setup socket client event handlers
    this.setupSocketHandlers();

    // Show error if one was passed to the scene
    if (this.errorMessage) {
      this.showError(this.errorMessage);
    }
  }
  
  setupSocketHandlers() {
    // When a room is created, move to the lobby
    window.socketClient.onRoomCreated = (data) => {
      console.log('Room created, moving to lobby');
      this.scene.start('LobbyScene', { 
        roomId: data.roomId,
        playerId: data.playerId,
        isHost: true 
      });
    };
    
    // When joining a room is successful
    window.socketClient.onRoomJoined = (data) => {
      console.log('Room joined, moving to lobby');
      this.scene.start('LobbyScene', { 
        roomId: data.roomId,
        playerId: data.playerId,
        isHost: false 
      });
    };
    
    // Handle errors
    window.socketClient.onError = (message) => {
      this.showError(message);
    };
  }
  
  buttonHover(button) {
    button.setStyle({ backgroundColor: '#3333aa' });
  }
  
  buttonOut(button) {
    button.setStyle({ backgroundColor: '#222266' });
  }
  
  showCreateGame() {
    this.menuContainer.setVisible(false);
    this.createFormContainer.setVisible(true);
  }
  
  showJoinGame() {
    this.menuContainer.setVisible(false);
    this.joinFormContainer.setVisible(true);
  }
  
  startSinglePlayer() {
    // Start the standard single player game
    this.scene.start('SinglePlayerStart');
  }
  
  createForm(title) {
    const container = this.add.container(400, 300);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8)
      .setStrokeStyle(2, 0x3333aa);
    container.add(bg);
    
    // Title
    const titleText = this.add.text(0, -120, title, {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 28,
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(titleText);
    
    // Name input label
    const nameLabel = this.add.text(-150, -60, 'Your Name:', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 20,
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    container.add(nameLabel);
    
    // Name input field
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.style = `
      width: 200px;
      padding: 8px;
      border: 2px solid #3333aa;
      border-radius: 4px;
      background-color: #111133;
      color: white;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
    `;
    nameInput.value = 'Player';
    document.getElementById('game-container').appendChild(nameInput);
    
    // Move input right of label
    const nameElement = this.add.dom(80, -60, nameInput);
    container.add(nameElement);
    
    // Create room button
    const createButton = this.add.text(0, 40, 'Create', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 20,
      backgroundColor: '#222266',
      color: '#ffffff',
      padding: { left: 15, right: 15, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.buttonHover(createButton))
      .on('pointerout', () => this.buttonOut(createButton))
      .on('pointerdown', () => {
        const name = nameInput.value.trim() || 'Player';
        window.socketClient.createRoom(name);
      });
    container.add(createButton);
    
    // Back button
    const backButton = this.add.text(0, 100, 'Back to Menu', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 18,
      color: '#aaaaaa'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => backButton.setStyle({ color: '#ffffff' }))
      .on('pointerout', () => backButton.setStyle({ color: '#aaaaaa' }))
      .on('pointerdown', () => {
        nameInput.remove();
        container.setVisible(false);
        this.menuContainer.setVisible(true);
      });
    container.add(backButton);
    
    // Error message (initially empty)
    const errorText = this.add.text(0, 150, '', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 16,
      color: '#ff0000'
    }).setOrigin(0.5);
    container.add(errorText);
    container.errorText = errorText;
    
    return container;
  }
  
  createJoinForm() {
    const container = this.add.container(400, 300);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8)
      .setStrokeStyle(2, 0x3333aa);
    container.add(bg);
    
    // Title
    const titleText = this.add.text(0, -120, 'Join Game', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 28,
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(titleText);
    
    // Name input
    const nameLabel = this.add.text(-150, -70, 'Your Name:', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 20,
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    container.add(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.style = `
      width: 200px;
      padding: 8px;
      border: 2px solid #3333aa;
      border-radius: 4px;
      background-color: #111133;
      color: white;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
    `;
    nameInput.value = 'Player';
    document.getElementById('game-container').appendChild(nameInput);
    
    // Move input right of label
    const nameElement = this.add.dom(80, -70, nameInput);
    container.add(nameElement);
    
    // Room code input
    const roomLabel = this.add.text(-150, 0, 'Room Code:', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 20,
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    container.add(roomLabel);
    
    const roomInput = document.createElement('input');
    roomInput.type = 'text';
    roomInput.maxLength = 6;
    roomInput.style = `
      position: absolute;
      width: 200px;
      padding: 8px;
      border: 2px solid #3333aa;
      border-radius: 4px;
      background-color: #111133;
      color: white;
      font-size: 16px;
      text-transform: uppercase;
      font-family: 'Roboto', sans-serif;
    `;
    document.getElementById('game-container').appendChild(roomInput);
    
    const roomElement = this.add.dom(50, 0, roomInput);
    container.add(roomElement);
    
    // Join button
    const joinButton = this.add.text(0, 70, 'Join', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 20,
      backgroundColor: '#222266',
      color: '#ffffff',
      padding: { left: 15, right: 15, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.buttonHover(joinButton))
      .on('pointerout', () => this.buttonOut(joinButton))
      .on('pointerdown', () => {
        const name = nameInput.value.trim() || 'Player';
        const roomId = roomInput.value.trim().toUpperCase();
        
        if (!roomId) {
          this.showError('Please enter a room code');
          return;
        }
        
        window.socketClient.joinRoom(roomId, name);
      });
    container.add(joinButton);
    
    // Back button
    const backButton = this.add.text(0, 130, 'Back to Menu', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 18,
      color: '#aaaaaa'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => backButton.setStyle({ color: '#ffffff' }))
      .on('pointerout', () => backButton.setStyle({ color: '#aaaaaa' }))
      .on('pointerdown', () => {
        nameInput.remove();
        roomInput.remove();
        container.setVisible(false);
        this.menuContainer.setVisible(true);
      });
    container.add(backButton);
    
    // Error message (initially empty)
    const errorText = this.add.text(0, 180, '', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 16,
      color: '#ff0000'
    }).setOrigin(0.5);
    container.add(errorText);
    container.errorText = errorText;
    
    return container;
  }
  
  showError(message) {
    // Show error message in the currently visible form
    if (this.createFormContainer.visible) {
      this.createFormContainer.errorText.setText(message);
    } else if (this.joinFormContainer.visible) {
      this.joinFormContainer.errorText.setText(message);
    }
    
    // Clear error after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.createFormContainer.errorText) {
        this.createFormContainer.errorText.setText('');
      }
      if (this.joinFormContainer.errorText) {
        this.joinFormContainer.errorText.setText('');
      }
    });
  }
  
  update() {
    // Animate background scrolling for visual consistency
    if (this.background) {
      this.background.tilePositionY -= 0.3;
    }
  }
  
  shutdown() {
    // Clean up DOM elements when scene changes
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.remove());
  }
} 