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
    this.add.text(400, 80, 'Credits', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 40,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Credits content
    const creditsText = [
      "Game Development",
      "----------------",
      "Programming and Game Design: [Your Name]",
      "",
      "Assets",
      "------",
      "Wasp sprite by Spring Spring (CC0 1.0)",
      "https://opengameart.org/content/wasp-0",
      "",
      "Jellyfish sprites by rapidpunches (CC BY-SA 4.0)",
      "https://opengameart.org/content/primary-jellies",
      "",
      "Space background from Phaser setup",
      "",
      "Spaceship sprites generated using GrokAI",
      "",
      "Technologies",
      "-----------",
      "Built with Phaser.js (https://phaser.io/)",
      "Multiplayer functionality with Socket.io (https://socket.io/)",
      "Server powered by Express.js (https://expressjs.com/)"
    ];
    
    // Create a container for credits text
    this.creditsTextObj = this.add.text(400, 180, creditsText, {
      fontFamily: '"Roboto", sans-serif',
      fontSize: 16,
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5, 0);

    // Calculate max scroll
    this.maxScroll = Math.max(0, this.creditsTextObj.height - 320); // 320px visible area
    this.scrollOffset = 0;

    // Back button (fixed position)
    const backButton = this.add.text(400, 520, 'Back to Menu', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: 20,
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

    // Mouse wheel scroll
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.scrollCredits(deltaY);
    });
    // Arrow key scroll
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  
  scrollCredits(deltaY) {
    // Scroll by deltaY (mouse wheel) or +/-20 (arrow keys)
    this.scrollOffset += deltaY;
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset, 0, this.maxScroll);
    this.creditsTextObj.y = 180 - this.scrollOffset;
  }

  update() {
    // Animate background
    const bgSprite = this.children.list.find(child => child.type === 'TileSprite');
    if (bgSprite) {
      bgSprite.tilePositionY -= 0.2;
    }
    // Arrow key scroll
    if (this.cursors.up.isDown) {
      this.scrollCredits(-4);
    } else if (this.cursors.down.isDown) {
      this.scrollCredits(4);
    }
  }
}

window.CreditsScene = CreditsScene; 