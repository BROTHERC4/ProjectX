// Background Manager for ProjectX
// Handles random background selection and ensures consistency across scenes

class BackgroundManager {
  constructor() {
    this.backgroundKeys = [
      'space',
      'space1', 
      'space2',
      'space3',
      'space4',
      'space5',
      'space6'
    ];
    
    this.currentBackground = null;
    this.backgroundsLoaded = false;
  }

  /**
   * Preload all background images
   * @param {Phaser.Scene} scene - The scene to load images in
   */
  preloadBackgrounds(scene) {
    // Load all space background images
    scene.load.image('space', 'assets/space.png');
    scene.load.image('space1', 'assets/space1.png');
    scene.load.image('space2', 'assets/space2.png');
    scene.load.image('space3', 'assets/space3.png');
    scene.load.image('space4', 'assets/space4.png');
    scene.load.image('space5', 'assets/space5.png');
    scene.load.image('space6', 'assets/space6.png');
    
    this.backgroundsLoaded = true;
  }

  /**
   * Randomly select a background for the current game session
   * Call this once when starting a new game
   */
  selectRandomBackground() {
    if (!this.backgroundsLoaded) {
      console.warn('Backgrounds not loaded yet, using default space background');
      this.currentBackground = 'space';
      return this.currentBackground;
    }
    
    const randomIndex = Math.floor(Math.random() * this.backgroundKeys.length);
    this.currentBackground = this.backgroundKeys[randomIndex];
    
    console.log(`Selected background: ${this.currentBackground}`);
    return this.currentBackground;
  }

  /**
   * Get the currently selected background key
   * @returns {string} The background key to use
   */
  getCurrentBackground() {
    if (!this.currentBackground) {
      this.selectRandomBackground();
    }
    return this.currentBackground;
  }

  /**
   * Reset the background selection (for new games)
   */
  reset() {
    this.currentBackground = null;
  }

  /**
   * Create a tiled background sprite
   * @param {Phaser.Scene} scene - The scene to create the background in
   * @param {number} x - X position
   * @param {number} y - Y position  
   * @param {number} width - Width of the background
   * @param {number} height - Height of the background
   * @returns {Phaser.GameObjects.TileSprite} The created background sprite
   */
  createBackground(scene, x = 400, y = 300, width = 800, height = 600) {
    const backgroundKey = this.getCurrentBackground();
    return scene.add.tileSprite(x, y, width, height, backgroundKey);
  }
}

// Create a global instance
window.backgroundManager = new BackgroundManager(); 