/**
 * Main game initialization
 */
window.addEventListener('DOMContentLoaded', function() {
  if (typeof debugLog !== 'undefined') {
    debugLog('Game.js loaded, initializing game...');
  } else {
    console.log('Game.js loaded, initializing game...');
  }

  try {
    // Game configuration
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      dom: {
        createContainer: true
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [
        MenuScene,
        Start,
        SinglePlayerStart,
        LobbyScene,
        GameOverScene,
        SinglePlayerGameOver
      ]
    };
    
    // Initialize SocketClient before the game
    if (typeof debugLog !== 'undefined') debugLog('Creating socket client...');
    window.socketClient = new SocketClient();
    
    // Initialize the game
    if (typeof debugLog !== 'undefined') debugLog('Creating Phaser game instance...');
    const game = new Phaser.Game(config);
    
    // Store the game instance for access across scenes
    window.game = game;
    
    // Dispatch event to hide loading screen
    if (typeof debugLog !== 'undefined') debugLog('Dispatching phaser-ready event...');
    document.dispatchEvent(new Event('phaser-ready'));

    // Also use the direct method to hide the loading screen
    if (typeof window.hideLoadingScreen === 'function') {
      if (typeof debugLog !== 'undefined') debugLog('Calling hideLoadingScreen directly...');
      setTimeout(window.hideLoadingScreen, 500); // Small delay to ensure it happens after initialization
    }
  } catch (error) {
    if (typeof debugLog !== 'undefined') {
      debugLog('ERROR initializing game: ' + error.message);
    } else {
      console.error('ERROR initializing game:', error);
    }
    
    // Show error on loading screen
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
      loadingMessage.innerHTML = 'Error initializing game: ' + error.message + '<br>Please refresh the page.';
    }
  }
}); 