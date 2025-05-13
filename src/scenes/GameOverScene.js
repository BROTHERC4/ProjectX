export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        // Add game over text
        this.add.text(400, 200, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Add final score
        this.add.text(400, 300, `Final Score: ${this.score}`, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.text(400, 400, 'Click to Restart', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Make the button interactive
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }
} 