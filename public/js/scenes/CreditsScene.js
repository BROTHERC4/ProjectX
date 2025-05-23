/**
 * Credits Scene - Shows game credits and attributions with mobile touch scrolling
 */
class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
    this.scrollOffset = 0;
    this.maxScroll = 0;
    
    // Mobile touch scrolling variables
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isTouching = false;
    this.lastTouchY = 0;
    this.touchVelocity = 0;
    this.inertiaDecay = 0.95; // How quickly inertia fades
    this.isMobile = this.detectMobile();
  }

  detectMobile() {
    // Check for mobile device
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (window.innerWidth <= 768);
  }

  preload() {
    // Load background images using background manager
    if (window.backgroundManager) {
      window.backgroundManager.preloadBackgrounds(this);
    } else {
      // Fallback if background manager is not available
      this.load.image('background', 'assets/space.png');
    }
  }

  create() {
    // Background using background manager
    if (window.backgroundManager) {
      this.background = window.backgroundManager.createBackground(this);
    } else {
      // Fallback if background manager is not available
      this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
    }
    
    // Title
    this.add.text(400, 50, 'Credits', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 40,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Credits content with proper license compliance and AI acknowledgment
    const creditsText = [
      "ProjectX Multiplayer",
      "===================",
      "A retro space shooter inspired by Decimation X",
      "",
      "Game Development",
      "----------------",
      "Programming and Game Design: JC", 
      "",
      "AI Development Assistance",
      "-------------------------",
      "Claude Sonnet 4: Code architecture, game logic,",
      "and problem-solving assistance",
      "",
      "Cursor AI: AI-powered code editor for rapid",
      "development, debugging, and code completion",
      "",
      "Human creativity combined with AI efficiency",
      "to create this retro gaming experience",
      "",
      "Asset Credits",
      "-------------",
      "Jellyfish sprites by RAPIDPUNCHES",
      "Source: opengameart.org/content/primary-jellies",
      "License: CC BY 3.0",
      "",
      "Heart/Lives icon by NicoleMarieProductions",  
      "Source: opengameart.org/content/heart-1616",
      "License: CC BY 3.0",
      "",
      "Optional Credits (Public Domain)",
      "--------------------------------",
      "Wasp sprite by Spring Spring",
      "Source: opengameart.org/content/wasp-0", 
      "License: CC0 1.0 (Public Domain)",
      "",
      "Space backgrounds by Screaming Brain Studios",
      "Source: screamingbrainstudios.itch.io/",
      "seamless-space-backgrounds",
      "License: CC0 1.0 (Public Domain)",
      "",
      "Spaceship sprites generated using GrokAI",
      "License: CC0 1.0 (Public Domain)",
      "",
      "Technologies & Platforms",
      "-----------------------",
      "Game Engine: Phaser.js 3.60+ (MIT License)",
      "https://phaser.io/",
      "",
      "Multiplayer: Socket.io 4.7+ (MIT License)",
      "https://socket.io/",
      "",
      "Server: Express.js 4.18+ (MIT License)",
      "https://expressjs.com/",
      "",
      "Deployment Platform: Railway",
      "https://railway.app/",
      "Modern hosting with WebSocket support",
      "",
      "Development Environment",
      "-----------------------",
      "Visual Studio Code with Cursor AI extension",
      "Node.js 18+ runtime environment",
      "Git version control",
      "GitHub repository hosting",
      "",
      "License Information",
      "-------------------",
      "This game is licensed under GNU GPL v3",
      "All assets are properly licensed and compatible",
      "",
      "CC BY 3.0: Attribution required (see above)",
      "CC0 1.0: Public Domain, no attribution required",
      "MIT: Permissive open source license",
      "",
      "Inspiration",
      "-----------",
      "This game was inspired by classic arcade",
      "space shooters, particularly Decimation X,",
      "Space Invaders, and other retro shmup games",
      "",
      "Special Thanks",
      "--------------",
      "The OpenGameArt community for quality assets",
      "Phaser.js community for excellent documentation",
      "Socket.io team for reliable multiplayer support",
      "Railway platform for seamless deployment",
      "",
      "AI Revolution in Game Development",
      "--------------------------------",
      "This project demonstrates the potential",
      "of AI-assisted programming, where human",
      "creativity guides AI capabilities to create",
      "engaging interactive experiences",
      "",
      "The future of game development is collaborative:",
      "Human imagination + AI efficiency = Better games",
      "",
      "Thank you for playing!",
      "---------------------",
      "Made with 🚀 AI assistance, 💻 human creativity,",
      "and ☕ lots of coffee",
      "",
      "Visit the GitHub repository for source code",
      "and contribute to the project!",
      "",
      "© 2025 - Licensed under GNU GPL v3"
    ];
    
    // Create a container for credits text
    this.creditsTextObj = this.add.text(400, 120, creditsText, {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 14,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0);

    // Calculate max scroll - increased for longer credits
    this.maxScroll = Math.max(0, this.creditsTextObj.height - 360); // 360px visible area
    this.scrollOffset = 0;

    // Back button (fixed position)
    const backButton = this.add.text(400, 540, 'Back to Menu', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 18,
      backgroundColor: '#222266',
      color: '#ffffff',
      padding: { left: 15, right: 15, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => backButton.setStyle({ backgroundColor: '#3333aa' }))
      .on('pointerout', () => backButton.setStyle({ backgroundColor: '#222266' }))
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });

    // Instructions text (fixed position) - updated for mobile
    const instructionText = this.isMobile ? 
      'Swipe to scroll' : 
      'Use arrow keys or mouse wheel to scroll';
      
    this.add.text(400, 90, instructionText, {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 12,
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Mouse wheel scroll (desktop)
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.scrollCredits(deltaY * 0.5);
    });
    
    // Arrow key scroll (desktop)
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // MOBILE TOUCH SCROLLING SETUP
    if (this.isMobile) {
      this.setupMobileScrolling();
    }
  }
  
  setupMobileScrolling() {
    // Create an invisible zone covering the scrollable area
    this.scrollZone = this.add.zone(400, 300, 800, 500) // Cover most of the screen except buttons
      .setInteractive()
      .setDepth(-1); // Behind other elements
    
    // Touch start event
    this.scrollZone.on('pointerdown', (pointer) => {
      this.isTouching = true;
      this.touchStartY = pointer.y;
      this.lastTouchY = pointer.y;
      this.touchStartTime = Date.now();
      this.touchVelocity = 0; // Reset velocity
      console.log('[MOBILE CREDITS] Touch scroll started at:', pointer.y);
    });
    
    // Touch move event (dragging)
    this.scrollZone.on('pointermove', (pointer) => {
      if (this.isTouching) {
        const deltaY = this.lastTouchY - pointer.y; // Inverted for natural scroll direction
        const timeDelta = Date.now() - this.touchStartTime;
        
        // Calculate velocity for inertia
        if (timeDelta > 0) {
          this.touchVelocity = deltaY / Math.max(timeDelta * 0.016, 1); // Normalize to 60fps
        }
        
        // Scroll immediately during drag
        this.scrollCredits(deltaY * 2); // Multiply for more responsive scrolling
        
        this.lastTouchY = pointer.y;
        this.touchStartTime = Date.now();
      }
    });
    
    // Touch end event
    this.scrollZone.on('pointerup', (pointer) => {
      if (this.isTouching) {
        this.isTouching = false;
        console.log('[MOBILE CREDITS] Touch scroll ended with velocity:', this.touchVelocity);
        
        // Apply inertia based on final velocity
        this.touchVelocity = Phaser.Math.Clamp(this.touchVelocity, -50, 50); // Cap velocity
      }
    });
    
    // Also handle pointer out (when finger leaves the screen)
    this.scrollZone.on('pointerout', (pointer) => {
      if (this.isTouching) {
        this.isTouching = false;
        console.log('[MOBILE CREDITS] Touch scroll cancelled (pointer out)');
      }
    });
    
    console.log('[MOBILE CREDITS] Mobile scrolling setup complete');
  }
  
  scrollCredits(deltaY) {
    // Scroll by deltaY (mouse wheel) or +/-3 (arrow keys) or touch drag
    this.scrollOffset += deltaY;
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset, 0, this.maxScroll);
    this.creditsTextObj.y = 120 - this.scrollOffset;
  }

  update() {
    // Animate background
    if (this.background && this.background.tilePositionY !== undefined) {
      this.background.tilePositionY -= 0.2;
    }
    
    // Arrow key scroll (desktop)
    if (this.cursors && this.cursors.up.isDown) {
      this.scrollCredits(-3);
    } else if (this.cursors && this.cursors.down.isDown) {
      this.scrollCredits(3);
    }
    
    // Apply touch inertia for smooth mobile scrolling
    if (!this.isTouching && Math.abs(this.touchVelocity) > 0.1) {
      this.scrollCredits(this.touchVelocity);
      this.touchVelocity *= this.inertiaDecay; // Gradually slow down
      
      // Stop very small velocities
      if (Math.abs(this.touchVelocity) < 0.1) {
        this.touchVelocity = 0;
      }
    }
  }
}

window.CreditsScene = CreditsScene; 