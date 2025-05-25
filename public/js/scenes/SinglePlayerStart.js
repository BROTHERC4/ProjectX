// import { ObjectPool } from '../../src/utils/ObjectPool.js';

class SinglePlayerStart extends Phaser.Scene {

    constructor() {
        super('SinglePlayerStart');
        this.DEBUG = true; // Set to false in production
    }

    preload() {
        // Reset background selection for new game and load all backgrounds
        if (window.backgroundManager) {
            window.backgroundManager.reset();
            window.backgroundManager.preloadBackgrounds(this);
        } else {
            // Fallback if background manager is not available
            this.load.image('background', 'assets/space.png');
        }
        
        // Load mobile controls assets
        this.load.image('pointer', 'assets/Pointer.png');
        
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
        // Clean up any leftover particles from previous games
        this.cleanupAllParticles();

        // Create player bullets using Phaser physics groups
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        // Create enemy bullets using Phaser physics groups
        this.enemyBullets = this.physics.add.group({
            defaultKey: 'enemy-bullet',
            maxSize: 30
        });
        
        // Game state flags
        this.gameOver = false;

        // Initialize wave manager
        this.waveManager = new WaveManager();

        // Add missing constants for single player
        this.ENEMY_BULLET_SPEED = 250;
        this.BULLET_SPEED = 400;

        // Create animations for the enemies
        this.createAnimations();
        
        // Background using background manager
        if (window.backgroundManager) {
            this.background = window.backgroundManager.createBackground(this);
        } else {
            // Fallback if background manager is not available
            this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
        }

        // Initialize score and lives
        this.score = 0;
        this.lives = 3;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '24px', 
            fill: '#fff',
            fontFamily: 'Arial'
        });

        // Add wave display
        this.waveText = this.add.text(400, 16, 'Wave: 1', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0);

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
        
        // Initialize mobile controls
        this.mobileControls = new MobileControls(this);
        
        // Setup camera follow for mobile if needed
        this.mobileControls.setupCameraFollow(this.player);

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
        if (this.background) {
            this.background.tilePositionY -= 0.5;
        }
        
        // Skip if game is over
        if (this.gameOver) return;

        // Ensure player exists and is active
        if (!this.player || !this.player.active) {
            if (this.DEBUG && !this.gameOver) console.log("Player missing in update! Player exists:", !!this.player, "active:", this.player?.active, "visible:", this.player?.visible);
            return;
        }

        // Check if player is invisible or inactive (might indicate a problem)
        if ((!this.player.visible || !this.player.active) && this.DEBUG) {
            if (this.playerInvincible) {
                // During invincibility, force player to stay active and visible
                console.log("Player became inactive/invisible during invincibility - fixing immediately");
                this.player.setActive(true);
                this.player.setVisible(true);
            } else {
                console.log("Player is inactive/invisible but not invincible - triggering emergency recovery");
                this.emergencyPlayerRecovery();
            }
        }

        // AGGRESSIVE PROTECTION: Force player to stay active and visible during invincibility
        if (this.playerInvincible && this.player) {
            if (!this.player.active || !this.player.visible) {
                this.player.setActive(true);
                this.player.setVisible(true);
                if (this.DEBUG) console.log("Forced player active/visible during invincibility period");
            }
        }

        // Handle player input (keyboard + mobile)
        let leftPressed = this.cursors.left.isDown;
        let rightPressed = this.cursors.right.isDown;
        let firePressed = this.fireKey.isDown;
        
        // Check mobile controls if available
        if (this.mobileControls && this.mobileControls.isMobile) {
            const mobileInput = this.mobileControls.getInput();
            if (mobileInput) {
                leftPressed = leftPressed || mobileInput.left;
                rightPressed = rightPressed || mobileInput.right;
                firePressed = firePressed || mobileInput.fire;
            }
        }
        
        // Apply movement
        if (leftPressed) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (rightPressed) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        // Continuous firing when space is held down or mobile fire is pressed
        if (firePressed && time > this.lastFired + this.fireRate) {
            this.fireBullet();
            this.lastFired = time;
        }

        // Update enemy positions and handle shooting
        this.updateEnemies(time, delta);

        // Check for wave completion and generate next wave
        this.checkWaveCompletion();

        // Move enemy bullets
        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.active) {
                bullet.y += this.ENEMY_BULLET_SPEED * (delta / 1000);
                
                // Remove bullets that go off screen
                if (bullet.y > 650) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            }
        });

        // Move player bullets
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.active) {
                bullet.y -= this.BULLET_SPEED * (delta / 1000);
                
                // Remove bullets that go off screen
                if (bullet.y < -20) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            }
        });
    }

    checkWaveCompletion() {
        // Check if all enemies are defeated
        if (this.enemies.children.size === 0 && this.waveManager && !this.waveManager.waveTransition) {
            const waveResult = this.waveManager.checkWaveComplete([]);
            
            if (waveResult.waveComplete) {
                console.log(`[SINGLE PLAYER] Wave ${waveResult.waveNumber - 1} complete! Starting wave ${waveResult.waveNumber}`);
                
                // Show wave transition message
                this.showWaveTransition(waveResult.waveNumber - 1, waveResult.waveNumber);
                
                // Generate new enemies after delay
                this.time.delayedCall(waveResult.delay, () => {
                    this.createEnemiesFromData(waveResult.newEnemies);
                    this.updateWaveDisplay();
                });
            }
        }
    }

    showWaveTransition(completedWave, nextWave) {
        // Create wave completion text
        const waveCompleteText = this.add.text(400, 250, `Wave ${completedWave} Complete!`, {
            fontSize: '32px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const nextWaveText = this.add.text(400, 300, `Preparing Wave ${nextWave}...`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Fade out after delay
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: [waveCompleteText, nextWaveText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    waveCompleteText.destroy();
                    nextWaveText.destroy();
                }
            });
        });
    }

    updateWaveDisplay() {
        if (this.waveManager && this.waveText) {
            this.waveText.setText(`Wave: ${this.waveManager.getCurrentWave()}`);
        }
    }

    fireBullet() {
        const bullet = this.bullets.get(this.player.x, this.player.y - 30);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-this.BULLET_SPEED);
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
        // Use wave manager to generate enemies if available
        if (this.waveManager) {
            const enemies = this.waveManager.generateWave();
            this.createEnemiesFromData(enemies);
            this.updateWaveDisplay();
        } else {
            // Fallback to original enemy creation if wave manager not available
            this.createStaticEnemies();
        }
    }

    createEnemiesFromData(enemyData) {
        enemyData.forEach(enemyInfo => {
            let enemy;
            let scale;
            
            switch (enemyInfo.type) {
                case 'wasp':
                    enemy = this.wasps.create(enemyInfo.position.x, enemyInfo.position.y, 'wasp-sheet');
                    enemy.anims.play('wasp-anim');
                    scale = 1.5; // Original wasp size
                    break;
                case 'jellyfish-large':
                    enemy = this.jellyfishLarge.create(enemyInfo.position.x, enemyInfo.position.y, 'jellyfish-large1');
                    enemy.anims.play('jellyfish-large-frames');
                    scale = 2.0; // Original large jellyfish size
                    break;
                case 'jellyfish-medium':
                    enemy = this.jellyfishMedium.create(enemyInfo.position.x, enemyInfo.position.y, 'jellyfish-medium1');
                    enemy.anims.play('jellyfish-medium-frames');
                    scale = 1.7; // Original medium jellyfish size
                    break;
                case 'jellyfish-tiny':
                    enemy = this.jellyfishTiny.create(enemyInfo.position.x, enemyInfo.position.y, 'jellyfish-tiny1');
                    enemy.anims.play('jellyfish-tiny-frames');
                    scale = 1.4; // Original tiny jellyfish size
                    break;
                default:
                    scale = 1.0;
            }
            
            if (enemy) {
                enemy.health = enemyInfo.health;
                enemy.points = enemyInfo.points;
                enemy.movePattern = enemyInfo.movePattern;
                enemy.moveTimer = enemyInfo.moveTimer;
                enemy.originalX = enemyInfo.originalPosition.x;
                enemy.originalY = enemyInfo.originalPosition.y;
                enemy.waveNumber = enemyInfo.waveNumber;
                enemy.setScale(scale); // Use proper scale instead of 0.25
                
                // Add new formation movement properties
                enemy.targetX = enemyInfo.targetPosition ? enemyInfo.targetPosition.x : enemyInfo.originalPosition.x;
                enemy.targetY = enemyInfo.targetPosition ? enemyInfo.targetPosition.y : enemyInfo.originalPosition.y;
                enemy.formationReached = enemyInfo.formationReached || false;
                enemy.formationSpeed = 80; // Pixels per second to move into formation
                
                this.enemies.add(enemy);
            }
        });
    }

    createStaticEnemies() {
        // Original static enemy creation as fallback
        // ... existing static enemy creation code ...
    }

    updateEnemies(time, delta) {
        // Skip if game is over
        if (this.gameOver) return;
        
        let moveDown = false;
        let moveSpeed = this.enemySpeed * delta / 1000;
        
        // Clean up any enemies that might be stuck or in invalid states
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            // Remove enemies that have somehow gotten too far off screen
            if (enemy.y > 700 || (enemy.y < -200 && enemy.formationReached)) {
                console.log('Removing stuck enemy at:', enemy.x, enemy.y);
                this.enemies.remove(enemy, true, true);
                enemy.destroy();
                return;
            }
        });
        
        // Check if enemies should move down due to edge collision
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active || !enemy.formationReached) return; // Only check formed enemies for boundaries
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
                // Update target position if enemy reached formation
                if (enemy.formationReached) {
                    enemy.originalY += 5;
                    enemy.targetY += 5;
                }
            });
        }
        
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            // Handle formation movement first (move to target position)
            if (!enemy.formationReached) {
                const distToTargetX = Math.abs(enemy.x - enemy.targetX);
                const distToTargetY = Math.abs(enemy.y - enemy.targetY);
                
                // Move towards target position
                if (distToTargetX > 2) {
                    const dirX = enemy.targetX > enemy.x ? 1 : -1;
                    enemy.x += dirX * enemy.formationSpeed * delta / 1000;
                }
                
                if (distToTargetY > 2) {
                    const dirY = enemy.targetY > enemy.y ? 1 : -1;
                    enemy.y += dirY * enemy.formationSpeed * delta / 1000;
                }
                
                // Check if reached formation position
                if (distToTargetX <= 2 && distToTargetY <= 2) {
                    enemy.formationReached = true;
                    enemy.originalX = enemy.targetX;
                    enemy.originalY = enemy.targetY;
                    enemy.x = enemy.targetX;
                    enemy.y = enemy.targetY;
                }
            } else {
                // Normal enemy movement patterns once in formation
            enemy.x += moveSpeed * this.enemyDirection;
                
            switch(enemy.movePattern) {
                case 'zigzag':
                    enemy.moveTimer += delta;
                    enemy.y = enemy.originalY + Math.sin(enemy.moveTimer / 300) * 15;
                        // Only wasps (zigzag) can shoot, and only when in formation
                        if (!enemy.lastShotTime || time - enemy.lastShotTime > 1800) {
                            if (Phaser.Math.Between(0, 9500) < 5 * delta) {
                            this.enemyShoot(enemy);
                            enemy.lastShotTime = time;
                        }
                    }
                    break;
                case 'sineWave':
                case 'swooping':
                case 'standard':
                        // All non-wasp enemies have very slow descent once in formation
                        enemy.y += 0.002 * (delta);
                    break;
                }
            }
        });
    }
    
    enemyShoot(enemy) {
        if (!enemy || !enemy.active) return; // Ensure enemy is valid
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(this.ENEMY_BULLET_SPEED);
        }
    }

    bulletHitBarrier(bullet, barrierPiece) {
        // Skip if either object is not active or game is over
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
        
        // Skip collision if enemy hasn't reached formation yet (prevents off-screen collisions)
        if (!enemy.formationReached) return;
        
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
        // Skip if already hit or game over
        if (!bullet.active || !player.active || this.gameOver || this.playerInvincible) return;
        
        if (this.DEBUG) console.log("Player hit! Before processing - Player active:", player.active, "visible:", player.visible, "alpha:", player.alpha);
        
        // Deactivate the bullet first
        bullet.setActive(false);
        bullet.setVisible(false);
        
        // IMMEDIATELY ensure player stays active and visible (before anything else can interfere)
        player.setActive(true);
        player.setVisible(true);
        
        // Make player invincible temporarily
        this.playerInvincible = true;
        
        // Store original methods and override them to prevent deactivation during invincibility
        if (!player.originalSetActive) {
            player.originalSetActive = player.setActive.bind(player);
            player.originalSetVisible = player.setVisible.bind(player);
        }
        
        // Override setActive to prevent deactivation during invincibility
        player.setActive = function(value) {
            if (this.scene && this.scene.playerInvincible && !value) {
                if (this.scene.DEBUG) console.log("Blocked attempt to deactivate player during invincibility");
                return this; // Return this for chaining, but don't actually deactivate
            }
            return this.originalSetActive(value);
        };
        
        // Override setVisible to prevent hiding during invincibility
        player.setVisible = function(value) {
            if (this.scene && this.scene.playerInvincible && !value) {
                if (this.scene.DEBUG) console.log("Blocked attempt to hide player during invincibility");
                return this; // Return this for chaining, but don't actually hide
            }
            return this.originalSetVisible(value);
        };
        
        // Reduce lives
        this.lives--;
        this.updateLivesDisplay();
        
        if (this.DEBUG) console.log("Player hit! Lives remaining:", this.lives, "Player position:", player.x, player.y);
        
        if (this.lives <= 0) {
            this.handleGameOver();
        } else {
            // Clear nearby enemy bullets for safety (but keep player in same position)
            this.clearEnemyBulletsNearPlayer();
            
            // Stop player movement temporarily
            player.setVelocity(0, 0);
            
            // Force player to stay active and visible again (in case something changed it)
            player.setActive(true);
            player.setVisible(true);
            
            // Kill any existing tweens on the player to prevent conflicts
            this.tweens.killTweensOf(player);
            
            if (this.DEBUG) console.log("Player state after setup - active:", player.active, "visible:", player.visible, "alpha:", player.alpha);
            
            // Start a timer to continuously protect player during invincibility
            const protectionTimer = this.time.addEvent({
                delay: 16, // Check every frame (roughly 60fps)
                repeat: 62, // Run for about 1 second (1000ms / 16ms = 62.5)
                callback: () => {
                    if (player && this.playerInvincible) {
                        if (!player.active || !player.visible) {
                            player.setActive(true);
                            player.setVisible(true);
                            if (this.DEBUG) console.log("Timer protection: forced player active/visible");
                        }
                    }
                }
            });

            // Create blinking effect for invincibility (keep player in same spot)
            this.tweens.add({
                targets: player,
                alpha: 0.5, // Less transparent so player is still clearly visible
                duration: 200,
                yoyo: true,
                repeat: 4, // Blink 5 times total
                onUpdate: () => {
                    // Ensure player stays active and visible during the tween
                    if (!player.active || !player.visible) {
                        if (this.DEBUG) console.log("Player became inactive/invisible during tween - fixing");
                        player.setActive(true);
                        player.setVisible(true);
                    }
                },
                onComplete: () => {
                    if (this.DEBUG) console.log("Tween complete - Player exists:", !!player, "active:", player?.active, "visible:", player?.visible);
                    
                    // Stop the protection timer
                    if (protectionTimer) {
                        protectionTimer.destroy();
                    }
                    
                    if (player) {
                        player.alpha = 1;
                        
                        // Restore original methods before ending invincibility
                        if (player.originalSetActive) {
                            player.setActive = player.originalSetActive;
                            player.setVisible = player.originalSetVisible;
                            delete player.originalSetActive;
                            delete player.originalSetVisible;
                        }
                        
                        player.setActive(true);
                        player.setVisible(true);
                        this.playerInvincible = false;
                        if (this.DEBUG) console.log("Player invincibility ended - alpha:", player.alpha, "visible:", player.visible, "active:", player.active);
                    } else {
                        if (this.DEBUG) console.log("Player missing after tween, triggering emergency recovery");
                        this.emergencyPlayerRecovery();
                    }
                }
            });
        }
    }

    emergencyPlayerRecovery() {
        // Simplified emergency recovery - just reset invincibility if something goes wrong
        if (this.DEBUG) console.log("Emergency player recovery triggered");
        
        if (this.player) {
            // Restore original methods if they were overridden
            if (this.player.originalSetActive) {
                this.player.setActive = this.player.originalSetActive;
                this.player.setVisible = this.player.originalSetVisible;
                delete this.player.originalSetActive;
                delete this.player.originalSetVisible;
            }
            
            // Ensure player is visible and reset invincibility
            this.player.alpha = 1;
            this.player.setVisible(true);
            this.player.setActive(true);
            this.playerInvincible = false;
            
            // Stop any existing tweens on the player
            this.tweens.killTweensOf(this.player);
            
            // Reset position if player somehow got moved
            if (this.player.y < 400 || this.player.y > 600) {
                this.player.y = 550;
            }
            if (this.player.x < 0 || this.player.x > 800) {
                this.player.x = 400;
            }
            
            // Ensure physics body is working
            if (this.player.body) {
                this.player.body.enable = true;
                this.player.setVelocity(0, 0);
            }
            
            if (this.DEBUG) console.log("Emergency recovery completed - Player position:", this.player.x, this.player.y, "alpha:", this.player.alpha);
        } else {
            if (this.DEBUG) console.log("Player object missing completely - this should not happen!");
        }
    }

    handleGameOver() {
        if (this.DEBUG) console.log("GAME OVER");
        
        // Clean up any remaining particles
        this.cleanupAllParticles();
        
        // Hide mobile controls if active
        if (this.mobileControls) {
            this.mobileControls.hideControls();
        }
        
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
        this.scene.start('SinglePlayerGameOver', { score: this.score });
    }
    
    createExplosion(x, y) {
        if (x < -50 || x > 850 || y < -50 || y > 650) return;
        
        // Create simple explosion particles
        for (let i = 0; i < 5; i++) {
            const particle = this.physics.add.sprite(x, y, 'barrier-piece');
            particle.setVelocity(
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(-100, 100)
            );
            particle.setTint(0xff6600); // Orange color for explosion
            
            // Destroy particle after animation
            this.time.delayedCall(400, () => {
                if (particle && particle.active) {
                    particle.destroy();
                }
            });
        }
    }

    clearEnemyBulletsNearPlayer() {
        
        this.enemyBullets.children.each(bullet => {
            if (bullet.active) {
                const distToPlayer = Phaser.Math.Distance.Between(
                    bullet.x, bullet.y, 
                    this.player.x, this.player.y
                );
                
                // Clear bullets that are within 100 pixels of the player
                if (distToPlayer < 50) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                    if (this.DEBUG) console.log("Cleared enemy bullet near player");
                }
            }
        });
    }

    cleanupAllParticles() {
        // Find and destroy all particle emitters in the scene
        this.children.list.forEach(child => {
            if (child.type === 'ParticleEmitter' || child instanceof Phaser.GameObjects.Particles.ParticleEmitter) {
                try {
                    child.destroy();
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
        });
        
        // Also clean up any orphaned particle systems
        if (this.add && this.add.particleManager) {
            try {
                this.add.particleManager.removeAll();
            } catch (error) {
                // Ignore cleanup errors
            }
        }
        
        // Force garbage collection of particle effects
        if (this.DEBUG) {
            console.log("Cleaned up all particle effects");
        }
    }

    shutdown() {
        // MANDATORY: Clean up all resources
        if (this.DEBUG) console.log(`[${this.scene.key}] shutdown called`);

        // Destroy tweens
        this.tweens.killAll();

        // Remove timers
        this.time.removeAllEvents();

        // Remove input listeners
        this.input.removeAllListeners(); // General input
        if (this.cursors) {
            // If cursors were created with createCursorKeys, they don't need explicit destruction
            // but good to nullify references if not restarting scene immediately
             this.cursors = null;
        }
        if (this.fireKey) {
            this.fireKey = null;
        }


        // Destroy mobile controls
        if (this.mobileControls) {
            this.mobileControls.destroy();
            this.mobileControls = null;
        }

        // Cleanup particles (already called in handleGameOver, but good for general shutdown)
        this.cleanupAllParticles();

        // Destroy bullet groups
        if (this.bullets) {
            this.bullets.destroy(true, true); // Destroy children and group itself
            this.bullets = null;
        }
        if (this.enemyBullets) {
            this.enemyBullets.destroy(true, true); // Destroy children and group itself
            this.enemyBullets = null;
        }
        
        // Destroy physics groups (if any were not converted to pools or managed by pools)
        if (this.barrierPieces) {
            this.barrierPieces.destroy(true, true); // Destroy children and group itself
            this.barrierPieces = null;
        }
        if (this.enemies) {
            this.enemies.destroy(true, true);
            this.enemies = null;
        }
         if (this.jellyfishLarge) this.jellyfishLarge.destroy(true,true);
         if (this.jellyfishMedium) this.jellyfishMedium.destroy(true,true);
         if (this.jellyfishTiny) this.jellyfishTiny.destroy(true,true);
         if (this.wasps) this.wasps.destroy(true,true);


        // Destroy player
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        // Destroy UI elements
        if (this.scoreText) this.scoreText.destroy();
        if (this.waveText) this.waveText.destroy();
        if (this.livesGroup) this.livesGroup.destroy(true, true);
        if (this.gameOverText) this.gameOverText.destroy();
        if (this.finalScoreText) this.finalScoreText.destroy();
        if (this.restartText) this.restartText.destroy();

        // Destroy background
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        
        // Destroy any colliders that might still exist
        if (this.colliders) {
            Object.values(this.colliders).forEach(collider => {
                if (collider && collider.destroy) {
                    try {
                        collider.destroy();
                    } catch (e) {
                        if(this.DEBUG) console.warn("Error destroying collider during shutdown:", e);
                    }
                }
            });
            this.colliders = {};
        }


        // Log shutdown completion
        if (this.DEBUG) console.log(`[${this.scene.key}] shutdown complete`);
    }
}
window.SinglePlayerStart = SinglePlayerStart;