export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // Optionally load menu assets here
    }

    create() {
        this.add.text(400, 120, 'ProjectX', { fontSize: '48px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5);

        // Start Game button
        const startBtn = this.add.text(400, 250, 'Start Game', { fontSize: '32px', fill: '#0f0', backgroundColor: '#222', padding: { x: 20, y: 10 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Start');
            });

        // Host Multiplayer button (future)
        const hostBtn = this.add.text(400, 320, 'Host Multiplayer', { fontSize: '28px', fill: '#fff', backgroundColor: '#333', padding: { x: 16, y: 8 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // TODO: Implement multiplayer hosting
            });

        // Join Multiplayer button (future)
        const joinBtn = this.add.text(400, 380, 'Join Multiplayer', { fontSize: '28px', fill: '#fff', backgroundColor: '#333', padding: { x: 16, y: 8 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // TODO: Implement multiplayer joining
            });

        // Room code input (future, not functional yet)
        this.add.text(400, 430, 'Room Code:', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
        // (In the future, add an HTML input or Phaser input plugin here)
    }
} 