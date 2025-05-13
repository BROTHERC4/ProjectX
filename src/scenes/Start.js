export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.image('logo', 'assets/phaser.png');

        //  The ship sprite is CC0 from https://ansimuz.itch.io - check out his other work!
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });

        // Create a simple bullet sprite
        const graphics = this.make.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();
    }

    create() {
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        const logo = this.add.image(640, 200, 'logo');

        this.player = this.add.sprite(400, 500, 'ship');
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);

        this.player.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });
        this.player.play('fly');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 200;

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        this.lastFired = 0;
        this.fireRate = 200;

        this.tweens.add({
            targets: logo,
            y: 400,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });
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
        const bullet = this.bullets.get(this.player.x, this.player.y - 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-400);
        }
    }
}
