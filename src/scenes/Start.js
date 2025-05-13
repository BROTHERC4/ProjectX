export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        
        // Load the spaceship as a regular image, not a spritesheet
        this.load.image('ship', 'assets/spaceship.png');

        // Create a simple bullet sprite
        const graphics = this.make.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();
    }

    create() {
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        // Create player as a physics sprite
        this.player = this.physics.add.sprite(400, 500, 'ship');
        // Scale down the ship to fit the game's dimensions better
        this.player.setScale(0.2); 
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 200;

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        this.lastFired = 0;
        this.fireRate = 200;
    }

    update(time, delta) {
        this.background.tilePositionY -= 2;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.fireKey.isDown && time > this.lastFired) {
            this.fireBullet();
            this.lastFired = time + this.fireRate;
        }
    }

    fireBullet() {
        // Adjust bullet position to fire from the center of the ship
        const bullet = this.bullets.get(this.player.x, this.player.y - 40);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-400);
        }
    }
}
