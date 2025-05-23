/**
 * Mobile Controls Utility
 * Handles touch controls for mobile devices
 */
class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.isMobile = this.detectMobile();
    this.controlsVisible = false;
    
    // Touch states
    this.leftPressed = false;
    this.rightPressed = false;
    this.firePressed = false;
    
    // Control button references
    this.leftButton = null;
    this.rightButton = null;
    this.fireZone = null;
    
    // Initialize if mobile
    if (this.isMobile) {
      this.createMobileControls();
    }
  }
  
  detectMobile() {
    // Check for mobile device
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (window.innerWidth <= 768);
  }
  
  createMobileControls() {
    // Load the pointer sprite
    if (!this.scene.textures.exists('pointer')) {
      this.scene.load.image('pointer', 'assets/Pointer.png');
      this.scene.load.once('complete', () => {
        this.setupControlButtons();
      });
      this.scene.load.start();
    } else {
      this.setupControlButtons();
    }
  }
  
    setupControlButtons() {    const SCREEN_WIDTH = 800;    const SCREEN_HEIGHT = 600;    const BUTTON_SIZE = 80;    const BUTTON_Y = SCREEN_HEIGHT - 60; // Move lower to bottom edge        // Create left button (bottom left corner)    this.leftButton = this.scene.add.image(80, BUTTON_Y, 'pointer')      .setDisplaySize(BUTTON_SIZE, BUTTON_SIZE)      .setInteractive()      .setAlpha(0.7)      .setDepth(2000) // High depth to be on top      .setFlipX(true); // Flip for left direction        // Create right button (bottom right corner)    this.rightButton = this.scene.add.image(SCREEN_WIDTH - 80, BUTTON_Y, 'pointer')      .setDisplaySize(BUTTON_SIZE, BUTTON_SIZE)      .setInteractive()      .setAlpha(0.7)      .setDepth(2000);
    
    // Create invisible fire zone (entire screen except buttons)
    this.fireZone = this.scene.add.zone(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT)
      .setInteractive()
      .setDepth(1999); // Just below buttons
    
    // Set up touch events for left button
    this.leftButton.on('pointerdown', () => {
      this.leftPressed = true;
      this.leftButton.setAlpha(1);
      this.leftButton.setTint(0x00ff00);
    });
    
    this.leftButton.on('pointerup', () => {
      this.leftPressed = false;
      this.leftButton.setAlpha(0.7);
      this.leftButton.clearTint();
    });
    
    this.leftButton.on('pointerout', () => {
      this.leftPressed = false;
      this.leftButton.setAlpha(0.7);
      this.leftButton.clearTint();
    });
    
    // Set up touch events for right button
    this.rightButton.on('pointerdown', () => {
      this.rightPressed = true;
      this.rightButton.setAlpha(1);
      this.rightButton.setTint(0x00ff00);
    });
    
    this.rightButton.on('pointerup', () => {
      this.rightPressed = false;
      this.rightButton.setAlpha(0.7);
      this.rightButton.clearTint();
    });
    
    this.rightButton.on('pointerout', () => {
      this.rightPressed = false;
      this.rightButton.setAlpha(0.7);
      this.rightButton.clearTint();
    });
    
        // Set up fire zone (tap anywhere else to shoot)    this.fireZone.on('pointerdown', (pointer) => {      // Check if tap is not on control buttons      const buttonRadius = 50; // Area around buttons to ignore            // Check left button area (bottom left)      const leftButtonDist = Math.abs(pointer.x - 80) + Math.abs(pointer.y - BUTTON_Y);      // Check right button area (bottom right)       const rightButtonDist = Math.abs(pointer.x - (SCREEN_WIDTH - 80)) + Math.abs(pointer.y - BUTTON_Y);            if (leftButtonDist < buttonRadius || rightButtonDist < buttonRadius) {        // Tap is on or near control buttons, ignore        return;      }            this.firePressed = true;      // Create a brief visual effect at tap location      this.createFireEffect(pointer.x, pointer.y);    });
    
    this.fireZone.on('pointerup', () => {
      this.firePressed = false;
    });
    
    this.controlsVisible = true;
    console.log('[MOBILE] Mobile controls created and enabled');
  }
  
  createFireEffect(x, y) {
    // Create a brief flash effect at tap location
    const flash = this.scene.add.circle(x, y, 20, 0xffff00, 0.5)
      .setDepth(2001);
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
  
  // Get current input state (compatible with keyboard input format)
  getInput() {
    if (!this.isMobile) {
      return null; // Let keyboard handle it
    }
    
    return {
      left: this.leftPressed,
      right: this.rightPressed,
      fire: this.firePressed,
      time: Date.now()
    };
  }
  
  // Hide controls (for game over, etc.)
  hideControls() {
    if (this.controlsVisible) {
      if (this.leftButton) this.leftButton.setVisible(false);
      if (this.rightButton) this.rightButton.setVisible(false);
      if (this.fireZone) this.fireZone.setInteractive(false);
      this.controlsVisible = false;
    }
  }
  
  // Show controls
  showControls() {
    if (this.isMobile && !this.controlsVisible) {
      if (this.leftButton) this.leftButton.setVisible(true);
      if (this.rightButton) this.rightButton.setVisible(true);
      if (this.fireZone) this.fireZone.setInteractive(true);
      this.controlsVisible = true;
    }
  }
  
  // Clean up
  destroy() {
    if (this.leftButton) this.leftButton.destroy();
    if (this.rightButton) this.rightButton.destroy();
    if (this.fireZone) this.fireZone.destroy();
    this.controlsVisible = false;
  }
  
  // Setup camera following for mobile
  setupCameraFollow(player) {
    if (this.isMobile && player) {
      // Set camera to follow player with some constraints
      this.scene.cameras.main.startFollow(player);
      this.scene.cameras.main.setFollowOffset(0, 100); // Offset to keep player visible above controls
      this.scene.cameras.main.setDeadzone(100, 100); // Deadzone before camera moves
      this.scene.cameras.main.setBounds(0, 0, 800, 600); // Keep camera within game bounds
      console.log('[MOBILE] Camera follow enabled for mobile');
    }
  }
}

// Export for use in game scenes
window.MobileControls = MobileControls; 