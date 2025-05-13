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
        
        // Create a barrier piece sprite (white instead of green)
        const barrierGraphics = this.make.graphics();
        barrierGraphics.fillStyle(0xffffff, 1); // Changed from 0x00ff00 to 0xffffff (white)
        barrierGraphics.fillRect(0, 0, 8, 8);
        barrierGraphics.generateTexture('barrier-piece', 8, 8);
        barrierGraphics.destroy();
    }

    create() {
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        // Create barriers
        this.createBarriers();

        // Create player as a physics sprite
        // Moved player further down from y=530 to y=550
        this.player = this.physics.add.sprite(400, 550, 'ship');
        // Scale down the ship to fit the game's dimensions better
        this.player.setScale(0.15);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 200;

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        // Add collision between bullets and barriers
        this.physics.add.collider(this.bullets, this.barrierPieces, this.bulletHitBarrier, null, this);

        this.lastFired = 0;
        this.fireRate = 200;
    }

    update(time, delta) {
        // Further reduced background scrolling speed from 1 to 0.5
        this.background.tilePositionY -= 0.5;

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

        // Clean up bullets that are out of bounds
        this.bullets.children.each(bullet => {
            if (bullet.active && (bullet.y < 0 || bullet.y > 600)) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
    }

    fireBullet() {
        const bullet = this.bullets.get(this.player.x, this.player.y - 30);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-400);
        }
    }

    createBarriers() {
        // Create a physics group for barrier pieces
        this.barrierPieces = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });

        // Define the shape of a barrier using a 2D array
        // 1 means there's a barrier piece, 0 means empty space
        const barrierShape = [
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1]
        ];

        // Calculate evenly spaced positions for barriers
        // For 4 barriers, we need to divide the screen width (800) into 5 parts
        const screenWidth = 800;
        const numBarriers = 4;
        const spacing = screenWidth / (numBarriers + 1);
        
        // Create barriers at evenly spaced positions
        const barrierPositions = [];
        for (let i = 1; i <= numBarriers; i++) {
            barrierPositions.push(spacing * i);
        }
        
        barrierPositions.forEach(xPos => {
            // Create a barrier at position xPos
            this.createSingleBarrier(xPos, 450, barrierShape);
        });
    }

    createSingleBarrier(xPos, yPos, shape) {
        const pieceSize = 8;
        
        // Loop through the barrier shape and create pieces
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    // Calculate position for this piece
                    const x = xPos + (col * pieceSize) - (shape[row].length * pieceSize / 2);
                    const y = yPos + (row * pieceSize);
                    
                    // Create a barrier piece at this position
                    const piece = this.barrierPieces.create(x, y, 'barrier-piece');
                    piece.setImmovable(true);
                    
                    // Optional: Add some random durability to pieces (1-3 hits)
                    piece.durability = Phaser.Math.Between(1, 3);
                }
            }
        }
    }

    bulletHitBarrier(bullet, barrierPiece) {
        // Deactivate the bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        
        // Reduce barrier piece durability
        barrierPiece.durability--;
        
        // If durability is zero, destroy the piece
        if (barrierPiece.durability <= 0) {
            barrierPiece.destroy();
        } else {
            // Visually show damage by changing the alpha or tint
            barrierPiece.setAlpha(barrierPiece.durability / 3);
        }
    }
}
