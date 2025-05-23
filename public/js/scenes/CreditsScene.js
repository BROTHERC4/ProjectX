/**
 * Credits Scene - Shows game credits and attributions
 */
class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
    this.scrollOffset = 0;
    this.maxScroll = 0;
  }

  preload() {
    this.load.image('background', 'assets/space.png');
  }

  create() {
    // Background
    this.add.tileSprite(400, 300, 800, 600, 'background');
    
    // Title
    this.add.text(400, 50, 'Credits', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 40,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Credits content with proper license compliance
    const creditsText = [
      "Game Development",
      "----------------",
      "Programming and Game Design: JC",
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
      "Optional Credits",
      "----------------",
      "Wasp sprite by Spring Spring",
      "Source: opengameart.org/content/wasp-0", 
      "License: CC0 1.0 (Public Domain)",
      "",
      "Space backgrounds by Screaming Brain Studios",
      "Source: screamingbrainstudios.itch.io/seamless-space-backgrounds",
      "License: CC0 1.0 (Public Domain)",
      "",
      "Spaceship sprites generated using GrokAI",
      "License: CC0 1.0 (Public Domain)",
      "",
      "Technologies",
      "------------",
      "Built with Phaser.js (MIT License)",
      "https://phaser.io/",
      "",
      "Multiplayer functionality with Socket.io (MIT License)",
      "https://socket.io/",
      "",
      "Server powered by Express.js (MIT License)",
      "https://expressjs.com/",
      "",
      "License Information",
      "-------------------",
      "This game is licensed under GNU GPL v3",
      "All assets are properly licensed and compatible",
      "",
      "CC BY 3.0: Attribution required",
      "CC0 1.0: Public Domain, no attribution required",
      "MIT: Permissive open source license"
    ];
    
    // Create a container for credits text
    this.creditsTextObj = this.add.text(400, 120, creditsText, {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 14,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0);

    // Calculate max scroll
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

    // Instructions text (fixed position)
    this.add.text(400, 90, 'Use arrow keys or mouse wheel to scroll', {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 12,
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Mouse wheel scroll
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.scrollCredits(deltaY * 0.5);
    });
    // Arrow key scroll
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  
  scrollCredits(deltaY) {
    // Scroll by deltaY (mouse wheel) or +/-3 (arrow keys)
    this.scrollOffset += deltaY;
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset, 0, this.maxScroll);
    this.creditsTextObj.y = 120 - this.scrollOffset;
  }

  update() {
    // Animate background
    const bgSprite = this.children.list.find(child => child.type === 'TileSprite');
    if (bgSprite) {
      bgSprite.tilePositionY -= 0.2;
    }
    // Arrow key scroll
    if (this.cursors.up.isDown) {
      this.scrollCredits(-3);
    } else if (this.cursors.down.isDown) {
      this.scrollCredits(3);
    }
  }
}

window.CreditsScene = CreditsScene; 