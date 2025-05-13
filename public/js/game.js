/**
 * Main game initialization
 */
window.addEventListener('DOMContentLoaded', function() {
  // Game configuration
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [
      MenuScene,
      LobbyScene,
      StartScene,
      GameOverScene
    ]
  };
  
  // Initialize SocketClient before the game
  window.socketClient = new SocketClient();
  
  // Initialize the game
  const game = new Phaser.Game(config);
  
  // Store the game instance for access across scenes
  window.game = game;
  
  // Dispatch event to hide loading screen
  document.dispatchEvent(new Event('phaser-ready'));
}); 