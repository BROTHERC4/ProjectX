export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
        this.DEBUG = true; // Set to false in production
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.image('heart', 'assets/heart.png');
        
        // Load the spaceship as a regular image, not a spritesheet
        this.load.image('ship', 'assets/spaceship.png');
        this.load.image('ship-red', 'assets/spaceshipred.png');
        
        // Load enemy sprites - both individual frames and spritesheets
        // Large jellyfish sprites
        this.load.spritesheet('jellyfish-large-sheet', 'assets/jellyfish-large-Sheet.png', {
            frameWidth: 32,  // Adjust these values based on the actual dimensions
            frameHeight: 32
        });
        this.load.image('jellyfish-large1', 'assets/jellyfish-large1.png');
        this.load.image('jellyfish-large2', 'assets/jellyfish-large2.png');
        this.load.image('jellyfish-large3', 'assets/jellyfish-large3.png');
        this.load.image('jellyfish-large4', 'assets/jellyfish-large4.png');
        
        // Medium jellyfish sprites
        this.load.spritesheet('jellyfish-medium-sheet', 'assets/jellyfish-medium-Sheet.png', {
            frameWidth: 24,  // Adjust these values based on the actual dimensions
            frameHeight: 24
        });
        this.load.image('jellyfish-medium1', 'assets/jellyfish-medium1.png');
        this.load.image('jellyfish-medium2', 'assets/jellyfish-medium2.png');
        
        // Tiny jellyfish sprites
        this.load.spritesheet('jellyfish-tiny-sheet', 'assets/jellyfish-tiny-Sheet.png', {
            frameWidth: 16,  // Adjust these values based on the actual dimensions
            frameHeight: 16
        });
        this.load.image('jellyfish-tiny1', 'assets/jellyfish-tiny1.png');
        this.load.image('jellyfish-tiny2', 'assets/jellyfish-tiny2.png');
        
        // Wasp as a spritesheet (2 frames, 37x26)
        this.load.spritesheet('wasp-sheet', 'assets/wasp.png', {
            frameWidth: 37, frameHeight: 26
        });

        // Create a simple bullet sprite
        const graphics = this.make.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();
        
        // Create an enemy bullet sprite (red)
        const enemyBulletGraphics = this.make.graphics();
        enemyBulletGraphics.fillStyle(0xff0000, 1);
        enemyBulletGraphics.fillRect(0, 0, 4, 16);
        enemyBulletGraphics.generateTexture('enemy-bullet', 4, 16);
        enemyBulletGraphics.destroy();
        
        // Create a barrier piece sprite (white instead of green)
        const barrierGraphics = this.make.graphics();
        barrierGraphics.fillStyle(0xffffff, 1);
        barrierGraphics.fillRect(0, 0, 8, 8);
        barrierGraphics.generateTexture('barrier-piece', 8, 8);
        barrierGraphics.destroy();
    }

    create() {
        // Game state flags
        this.gameOver = false;

        // Create animations for the enemies
        this.createAnimations();
        
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        // Initialize score and lives
        this.score = 0;
        this.lives = 3;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '24px', 
            fill: '#fff',
            fontFamily: 'Arial'
        });

        // Create lives display
        this.livesGroup = this.add.group();
        this.updateLivesDisplay();

        // Invincibility flag
        this.playerInvincible = false;

        // Create game over text (initially hidden)
        this.gameOverText = this.add.text(400, 200, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);

        this.finalScoreText = this.add.text(400, 300, '', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);

        this.restartText = this.add.text(400, 400, 'Click to Restart', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);

        // Make restart text interactive
        this.restartText.setInteractive();
        this.restartText.on('pointerdown', () => {
            this.scene.restart();
        });

        // Create barriers
        this.createBarriers();

        // Create player as a physics sprite
        this.player = this.physics.add.sprite(400, 550, 'ship');
        this.player.setScale(0.15);
        this.player.setCollideWorldBounds(true);

        // Log player position every second
        this.time.addEvent({
            delay: 1000, // 1 second
            loop: true,
            callback: () => {
                if (this.player && this.player.active) {
                    console.log(`Player position: x=${this.player.x}, y=${this.player.y}`);
                }
            }
        });

        // Set up controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.playerSpeed = 200;

        // Create player bullets
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        // Create enemy bullets
        this.enemyBullets = this.physics.add.group({
            defaultKey: 'enemy-bullet',
            maxSize: 30
        });

        // Create enemy groups
        this.jellyfishLarge = this.physics.add.group();
        this.jellyfishMedium = this.physics.add.group();
        this.jellyfishTiny = this.physics.add.group();
        this.wasps = this.physics.add.group();

        // Add all enemies to a combined group for easier collision detection
        this.enemies = this.physics.add.group();

        // Create the enemies
        this.createEnemies();

        // Store all colliders
        this.colliders = {
            playerBulletBarrier: this.physics.add.collider(
                this.bullets, this.barrierPieces, this.bulletHitBarrier, null, this
            ),
            enemyBulletBarrier: this.physics.add.collider(
                this.enemyBullets, this.barrierPieces, this.bulletHitBarrier, null, this
            ),
            bulletEnemy: this.physics.add.overlap(
                this.bullets, this.enemies, this.bulletHitEnemy, null, this
            ),
            enemyBulletPlayer: this.physics.add.overlap(
                this.enemyBullets, this.player, this.enemyBulletHitPlayer, null, this
            )
        };

        // Set up timing variables for game logic
        this.lastFired = 0;
        this.fireRate = 200;
        this.enemyDirection = 1; // 1 for right, -1 for left
        this.enemySpeed = 35; // Slightly slower than before
        this.enemyMoveDown = false;
        this.enemyShotTime = 0;
    }

    createAnimations() {
        // Check if we have frame data for the spritesheets before creating animations
        if (this.textures.exists('jellyfish-large-sheet')) {
            // Create animation for large jellyfish
            this.anims.create({
                key: 'jellyfish-large-anim',
                frames: this.anims.generateFrameNumbers('jellyfish-large-sheet', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // If spritesheets aren't working correctly, we can create animations from individual frames
        this.anims.create({
            key: 'jellyfish-large-frames',
            frames: [
                { key: 'jellyfish-large1' },
                { key: 'jellyfish-large2' },
                { key: 'jellyfish-large3' },
                { key: 'jellyfish-large4' }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'jellyfish-medium-frames',
            frames: [
                { key: 'jellyfish-medium1' },
                { key: 'jellyfish-medium2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'jellyfish-tiny-frames',
            frames: [
                { key: 'jellyfish-tiny1' },
                { key: 'jellyfish-tiny2' }
            ],
            frameRate: 10,
            repeat: -1
        });

        // Wasp animation (spritesheet, 2 frames)
        this.anims.create({
            key: 'wasp-anim',
            frames: this.anims.generateFrameNumbers('wasp-sheet', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
    }

    update(time, delta) {
        // Background scrolling
        this.background.tilePositionY -= 0.5;

        // Skip game logic if game is over
        if (this.gameOver) {
            return;
        }

        // Check if player exists and is active
        if (this.player && this.player.active) {
            // Player movement
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-this.playerSpeed);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(this.playerSpeed);
            } else {
                this.player.setVelocityX(0);
            }

            // Player shooting
            if (this.fireKey.isDown && time > this.lastFired) {
                this.fireBullet();
                this.lastFired = time + this.fireRate;
            }
        }

        // Clean up bullets that are out of bounds
        this.bullets.children.each(bullet => {
            if (bullet.active && (bullet.y < 0 || bullet.y > 600)) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });

        this.enemyBullets.children.each(bullet => {
            if (bullet.active && (bullet.y < 0 || bullet.y > 600)) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });

        // Update enemy movement
        this.updateEnemies(time, delta);
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
        const screenWidth = 800;
        const numBarriers = 4;
        const spacing = screenWidth / (numBarriers + 1);
        
        // Create barriers at evenly spaced positions
        const barrierPositions = [];
        for (let i = 1; i <= numBarriers; i++) {
            barrierPositions.push(spacing * i);
        }
        
        barrierPositions.forEach(xPos => {
            this.createSingleBarrier(xPos, 450, barrierShape);
        });
    }

    createSingleBarrier(xPos, yPos, shape) {
        const pieceSize = 8;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const x = xPos + (col * pieceSize) - (shape[row].length * pieceSize / 2);
                    const y = yPos + (row * pieceSize);
                    
                    const piece = this.barrierPieces.create(x, y, 'barrier-piece');
                    piece.setImmovable(true);
                    piece.durability = Phaser.Math.Between(1, 3);
                }
            }
        }
    }

    createEnemies() {
        // Create rows of different enemy types
        
        // Wasp row (top row) - fastest, zigzag pattern
        for (let i = 0; i < 8; i++) {
            const wasp = this.wasps.create(100 + i * 80, 80, 'wasp-sheet');
            wasp.setScale(1.5); // Wasp size unchanged
            wasp.health = 1;
            wasp.points = 50;
            wasp.originalX = wasp.x;
            wasp.originalY = wasp.y;
            wasp.movePattern = 'zigzag';
            wasp.moveTimer = i * 100;
            wasp.play('wasp-anim');
            this.enemies.add(wasp);
        }
        
        // Large jellyfish row (second row) - slowest, highest health
        for (let i = 0; i < 8; i++) {
            const jellyLarge = this.jellyfishLarge.create(100 + i * 80, 150, 'jellyfish-large1');
            jellyLarge.setScale(2.0); // Slightly bigger
            jellyLarge.health = 3;
            jellyLarge.points = 30;
            jellyLarge.originalX = jellyLarge.x;
            jellyLarge.originalY = jellyLarge.y;
            jellyLarge.movePattern = 'sineWave';
            jellyLarge.moveTimer = i * 100;
            jellyLarge.play('jellyfish-large-frames');
            this.enemies.add(jellyLarge);
        }
        
        // Medium jellyfish row (third row) - medium movement and health
        for (let i = 0; i < 8; i++) {
            const jellyMed = this.jellyfishMedium.create(100 + i * 80, 220, 'jellyfish-medium1');
            jellyMed.setScale(1.7); // Slightly bigger
            jellyMed.health = 2;
            jellyMed.points = 20;
            jellyMed.originalX = jellyMed.x;
            jellyMed.originalY = jellyMed.y;
            jellyMed.movePattern = 'standard';
            jellyMed.play('jellyfish-medium-frames');
            this.enemies.add(jellyMed);
        }
        
        // Tiny jellyfish row (bottom row) - fast, less health
        for (let i = 0; i < 8; i++) {
            const jellyTiny = this.jellyfishTiny.create(100 + i * 80, 290, 'jellyfish-tiny1');
            jellyTiny.setScale(1.4); // Slightly bigger
            jellyTiny.health = 1;
            jellyTiny.points = 10;
            jellyTiny.originalX = jellyTiny.x;
            jellyTiny.originalY = jellyTiny.y;
            jellyTiny.movePattern = 'swooping';
            jellyTiny.moveTimer = i * 150;
            jellyTiny.play('jellyfish-tiny-frames');
            this.enemies.add(jellyTiny);
        }
    }

    updateEnemies(time, delta) {
        // Skip if game is over
        if (this.gameOver) return;
        let moveDown = false;
        let moveSpeed = this.enemySpeed * delta / 1000;
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            if ((enemy.x < 50 && this.enemyDirection < 0) || 
                (enemy.x > 750 && this.enemyDirection > 0)) {
                moveDown = true;
            }
        });
        if (moveDown) {
            this.enemyDirection *= -1;
            this.enemies.children.entries.forEach(enemy => {
                if (!enemy.active) return;
                enemy.y += 5;
            });
        }
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            enemy.x += moveSpeed * this.enemyDirection;
            switch(enemy.movePattern) {
                case 'zigzag':
                    enemy.moveTimer += delta;
                    enemy.y = enemy.originalY + Math.sin(enemy.moveTimer / 300) * 15;
                    // Only wasps (zigzag) can shoot
                    if (!enemy.lastShotTime || time - enemy.lastShotTime > 1800) { // Reduced shooting frequency
                        if (Phaser.Math.Between(0, 9500) < 5 * delta) { // Reduced chance to shoot
                            this.enemyShoot(enemy);
                            enemy.lastShotTime = time;
                        }
                    }
                    break;
                case 'sineWave':
                case 'swooping':
                case 'standard':
                    // All non-wasp enemies now have the same very slow descent
                    enemy.y += 0.002 * (delta); // Very slow constant descent (half speed)
                    break;
            }
        });
    }
    
    enemyShoot(enemy) {
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(250); // Increased bullet speed
        }
    }

    bulletHitBarrier(bullet, barrierPiece) {
        // Skip if either object is not active
        if (!bullet.active || !barrierPiece.active || this.gameOver) return;
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
    
    bulletHitEnemy(bullet, enemy) {
        // Skip if either object is not active or game is over
        if (!bullet.active || !enemy.active || this.gameOver) return;
        // Deactivate the bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        // Reduce enemy health
        enemy.health--;
        // Flash the enemy to indicate hit
        this.tweens.add({
            targets: enemy,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });
        // If health is zero, destroy the enemy
        if (enemy.health <= 0) {
            // Add points to score (use enemy.points)
            this.score += (enemy.points !== undefined ? enemy.points : 10);
            this.scoreText.setText('Score: ' + this.score);
            // Create destruction effect
            this.createExplosion(enemy.x, enemy.y);
            // Remove the enemy from all groups and destroy
            this.enemies.remove(enemy, true, true);
            if (enemy.movePattern === 'zigzag') this.wasps.remove(enemy, true, true);
            if (enemy.movePattern === 'sineWave') this.jellyfishLarge.remove(enemy, true, true);
            if (enemy.movePattern === 'standard') this.jellyfishMedium.remove(enemy, true, true);
            if (enemy.movePattern === 'swooping') this.jellyfishTiny.remove(enemy, true, true);
            enemy.destroy();
        }
    }
    
    updateLivesDisplay() {
        // Clear existing lives display
        this.livesGroup.clear(true, true);
        
        // Add heart icons for remaining lives
        for (let i = 0; i < this.lives; i++) {
            const heart = this.livesGroup.create(16 + (i * 30), 50, 'heart');
            heart.setScale(0.5);
        }
    }

    enemyBulletHitPlayer(bullet, player) {
        // Check for invincibility first
        if (!bullet.active || !player.active || this.gameOver || this.playerInvincible) return;

        // Set player as invincible
        this.playerInvincible = true;

        // Deactivate the bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.destroy();

        // Reduce lives
        this.lives--;
        this.updateLivesDisplay();
        if (this.DEBUG) console.log("Player hit! Lives remaining:", this.lives, "Player position:", player.x, player.y);

        if (this.lives <= 0) {
            this.handleGameOver();
        } else {
            // Reset player position and velocity
            player.x = 400;
            player.y = 550;
            if (player.setVelocity) player.setVelocity(0, 0);
            if (player.body && player.body.setAllowGravity) player.body.setAllowGravity(false);

            // Visual feedback for invincibility
            this.tweens.add({
                targets: player,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                repeat: 4,
                onComplete: () => {
                    if (player && player.active) {
                        player.alpha = 1;
                        this.playerInvincible = false;
                        if (this.DEBUG) console.log("Player invincibility ended, position:", player.x, player.y);
                    }
                }
            });
        }
    }

    handleGameOver() {
        if (this.DEBUG) console.log("GAME OVER");
        // Set game over flag
        this.gameOver = true;
        // Show game over UI
        this.gameOverText.setVisible(true);
        this.finalScoreText.setText(`Final Score: ${this.score}`).setVisible(true);
        this.restartText.setVisible(true);
        // Destroy all colliders to prevent further collision checks
        Object.values(this.colliders).forEach(collider => {
            if (collider && collider.destroy) {
                collider.destroy();
            }
        });
        // Clear this.colliders object
        this.colliders = {};
        // Make the player fade out
        if (this.player && this.player.active) {
            this.tweens.add({
                targets: this.player,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (this.player) {
                        this.player.destroy();
                        this.player = null;
                    }
                }
            });
        }
    }
    
    createExplosion(x, y) {
        // New Phaser 3.60+ particle API
        const emitter = this.add.particles(x, y, 'barrier-piece', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            gravityY: 300,
            quantity: 15,
            emitting: false // Don't continuously emit
        });
        // Emit all particles at once for explosion effect
        emitter.explode(15);
        // Clean up after animation completes
        this.time.delayedCall(1000, () => {
            emitter.destroy();
        });
    }
}
