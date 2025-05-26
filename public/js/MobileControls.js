/**
 * Mobile Controls Utility
 * Handles touch controls for mobile devices with multi-touch support
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
    
    // Multi-touch tracking - track each finger independently
    this.activePointers = new Map(); // Track multiple fingers by pointer ID
    this.leftButtonPointerId = null;
    this.rightButtonPointerId = null;
    this.firePointerIds = new Set(); // Multiple fingers can shoot
    
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
  
  setupControlButtons() {
    const SCREEN_WIDTH = 800;
    const SCREEN_HEIGHT = 600;
    const BUTTON_SIZE = 80;
    const BUTTON_Y = SCREEN_HEIGHT - 60;
    
    // Create left button (bottom left corner)
    this.leftButton = this.scene.add.image(80, BUTTON_Y, 'pointer')
      .setDisplaySize(BUTTON_SIZE, BUTTON_SIZE)
      .setInteractive()
      .setAlpha(0.7)
      .setDepth(2000)
      .setFlipX(true);
    
    // Create right button (bottom right corner)
    this.rightButton = this.scene.add.image(SCREEN_WIDTH - 80, BUTTON_Y, 'pointer')
      .setDisplaySize(BUTTON_SIZE, BUTTON_SIZE)
      .setInteractive()
      .setAlpha(0.7)
      .setDepth(2000);
    
    // Create invisible fire zone (entire screen)
    this.fireZone = this.scene.add.zone(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT)
      .setInteractive()
      .setDepth(1999);
    
    // MULTI-TOUCH LEFT BUTTON EVENTS
    this.leftButton.on('pointerdown', (pointer) => {
      // Only allow one finger per button
      if (this.leftButtonPointerId === null) {
        this.leftButtonPointerId = pointer.id;
        this.leftPressed = true;
        this.leftButton.setAlpha(1);
        this.leftButton.setTint(0x00ff00);
      }
    });
    
    this.leftButton.on('pointerup', (pointer) => {
      if (this.leftButtonPointerId === pointer.id) {
        this.leftButtonPointerId = null;
        this.leftPressed = false;
        this.leftButton.setAlpha(0.7);
        this.leftButton.clearTint();
      }
    });
    
    this.leftButton.on('pointerout', (pointer) => {
      if (this.leftButtonPointerId === pointer.id) {
        this.leftButtonPointerId = null;
        this.leftPressed = false;
        this.leftButton.setAlpha(0.7);
        this.leftButton.clearTint();
      }
    });
    
    // MULTI-TOUCH RIGHT BUTTON EVENTS
    this.rightButton.on('pointerdown', (pointer) => {
      // Only allow one finger per button
      if (this.rightButtonPointerId === null) {
        this.rightButtonPointerId = pointer.id;
        this.rightPressed = true;
        this.rightButton.setAlpha(1);
        this.rightButton.setTint(0x00ff00);
      }
    });
    
    this.rightButton.on('pointerup', (pointer) => {
      if (this.rightButtonPointerId === pointer.id) {
        this.rightButtonPointerId = null;
        this.rightPressed = false;
        this.rightButton.setAlpha(0.7);
        this.rightButton.clearTint();
      }
    });
    
    this.rightButton.on('pointerout', (pointer) => {
      if (this.rightButtonPointerId === pointer.id) {
        this.rightButtonPointerId = null;
        this.rightPressed = false;
        this.rightButton.setAlpha(0.7);
        this.rightButton.clearTint();
      }
    });
    
    // MULTI-TOUCH FIRE ZONE EVENTS  
    this.fireZone.on('pointerdown', (pointer) => {
      // Check if this pointer is already controlling a movement button
      if (pointer.id === this.leftButtonPointerId || pointer.id === this.rightButtonPointerId) {
        return; // Skip if this finger is already on a movement button
      }
      
      // Check if tap is in button exclusion zones
      const buttonRadius = 50; // Larger exclusion zone for fire detection
      const leftButtonDist = Math.abs(pointer.x - 80) + Math.abs(pointer.y - BUTTON_Y);
      const rightButtonDist = Math.abs(pointer.x - (SCREEN_WIDTH - 80)) + Math.abs(pointer.y - BUTTON_Y);
      
      if (leftButtonDist < buttonRadius || rightButtonDist < buttonRadius) {
        return; // Don't fire if tapping near buttons
      }
      
      // Add this pointer to fire pointers
      this.firePointerIds.add(pointer.id);
      this.firePressed = true;
      this.createFireEffect(pointer.x, pointer.y);
    });
    
    this.fireZone.on('pointerup', (pointer) => {
      // Remove this pointer from fire pointers
      if (this.firePointerIds.has(pointer.id)) {
        this.firePointerIds.delete(pointer.id);
        // Only stop firing if no other fingers are shooting
        if (this.firePointerIds.size === 0) {
          this.firePressed = false;
        }
      }
    });
    
    this.fireZone.on('pointermove', (pointer) => {
      // If this pointer is firing and moves to button area, stop it
      if (this.firePointerIds.has(pointer.id)) {
        const buttonRadius = 50;
        const leftButtonDist = Math.abs(pointer.x - 80) + Math.abs(pointer.y - BUTTON_Y);
        const rightButtonDist = Math.abs(pointer.x - (SCREEN_WIDTH - 80)) + Math.abs(pointer.y - BUTTON_Y);
        
        if (leftButtonDist < buttonRadius || rightButtonDist < buttonRadius) {
          this.firePointerIds.delete(pointer.id);
          if (this.firePointerIds.size === 0) {
            this.firePressed = false;
          }
        }
      }
    });
    
    this.controlsVisible = true;
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
    
    // Clear multi-touch tracking
    this.activePointers.clear();
    this.firePointerIds.clear();
    this.leftButtonPointerId = null;
    this.rightButtonPointerId = null;
  }
  
  // Setup camera following for mobile
  setupCameraFollow(player) {
    if (this.isMobile && player) {
      // Set camera to follow player with some constraints
      this.scene.cameras.main.startFollow(player);
      this.scene.cameras.main.setFollowOffset(0, 100); // Offset to keep player visible above controls
      this.scene.cameras.main.setDeadzone(100, 100); // Deadzone before camera moves
      this.scene.cameras.main.setBounds(0, 0, 800, 600); // Keep camera within game bounds
    }
  }
}

// Export for use in game scenes
window.MobileControls = MobileControls; 