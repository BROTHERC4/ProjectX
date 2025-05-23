# ProjectX Multiplayer

A retro 8-bit space shooter inspired by classic arcade games like Decimation X. Defend Earth from waves of alien invaders in this fast-paced shoot 'em up with both single-player and cooperative multiplayer modes.

## 🎮 Gameplay

Players control spaceships at the bottom of the screen, shooting upward at descending waves of enemies. Features include:

- **Progressive Wave System**: Infinite waves with increasing difficulty and procedural enemy generation
- **4 Enemy Types**: Wasps (fast, shooting), Large Jellyfish (tough, sine wave movement), Medium Jellyfish (standard), and Tiny Jellyfish (swarming, swooping)
- **Destructible Barriers**: Use cover strategically to protect against enemy fire
- **Cooperative Multiplayer**: Up to 4 players working together to survive
- **Dynamic Backgrounds**: Multiple space backgrounds randomly selected per game session
- **Classic Controls**: Arrow keys to move, spacebar to fire

## ✨ Features

- **Real-time Multiplayer**: Synchronized gameplay across all connected clients
- **Lobby System**: Create and join games with unique room codes
- **Wave Management**: Procedural enemy generation with classic Wave 1 layout and randomized subsequent waves
- **Visual Effects**: Particle explosions, hit flashes, invincibility blinking
- **Score Competition**: Individual scoring within cooperative gameplay
- **Responsive Design**: Optimized for both desktop and web browsers
- **Asset Attribution**: Fully compliant with Creative Commons licensing

## 🛠️ Development Tools

This game was developed with assistance from modern AI programming tools:

- **Claude Sonnet 4**: AI assistant for code architecture, game design, and problem-solving
- **Cursor AI**: AI-powered code editor for rapid development and debugging
- **Traditional Programming**: Combined with human creativity and game design expertise

## 📋 Prerequisites

- Node.js v14+ and npm
- Modern web browser with WebSocket support

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project-x-multiplayer.git
   cd project-x-multiplayer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🎯 Running the Game

### Development Mode

Run the server in development mode with automatic restart on file changes:

```bash
npm run dev
```

### Production Mode

Start the server in production mode:

```bash
npm start
```

Then open your browser and navigate to `http://localhost:3000` to play the game.

## 🎮 How to Play

### Main Menu
- **Create Game**: Host a multiplayer session and get a room code
- **Join Game**: Enter a room code to join an existing game
- **Single Player**: Play solo against AI enemies
- **Credits**: View asset attributions and development credits

### In-Game Controls
- **Left/Right Arrow Keys**: Move your spaceship horizontally
- **Spacebar**: Fire your weapon continuously
- **Strategy**: Use barriers for cover, coordinate with teammates in multiplayer

### Game Objective
- Destroy all enemies in each wave before they reach the bottom
- Protect your ship using destructible barriers
- Survive as many waves as possible
- In multiplayer: cooperate with other players for higher scores

## 🏗️ Project Structure

```
project-x-multiplayer/
├── server.js              # Main server entry point
├── gameState.js           # Server-side game state management  
├── roomManager.js         # Multiplayer room management
├── waveManager.js         # Wave generation and difficulty scaling
├── public/                # Client-side files
│   ├── index.html         # Main HTML file with loading screen
│   ├── assets/            # Game assets (sprites, backgrounds, audio)
│   └── js/                # Client-side JavaScript modules
│       ├── game.js        # Phaser game initialization
│       ├── socket-client.js # Socket.io client wrapper
│       ├── backgroundManager.js # Random background selection
│       └── scenes/        # Phaser game scenes
│           ├── menu.js    # Main menu with game creation/joining
│           ├── lobby.js   # Pre-game lobby with ready system
│           ├── start.js   # Main multiplayer game scene
│           ├── game-over.js # Multiplayer game over screen
│           ├── SinglePlayerStart.js # Single player game
│           └── CreditsScene.js # Asset attribution screen
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── NOTICE.md             # Detailed asset attributions
└── LICENSE               # GNU GPL v3 license
```

## 🚀 Deployment on Railway

This game is designed for deployment on [Railway](https://railway.app/), a modern platform for hosting full-stack applications.

### Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Railway account
- GitHub repository

### Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/your-template)

### Manual Deployment Steps

1. **Connect to Railway**:
   ```bash
   railway login
   railway init
   ```

2. **Deploy**:
   ```bash
   railway up
   ```

3. **Environment Configuration**:
   Railway automatically handles:
   - Port configuration (`process.env.PORT`)
   - WebSocket support for Socket.io
   - Static file serving

4. **Custom Domain** (Optional):
   ```bash
   railway domain
   ```

### Railway Features Used
- **WebSocket Support**: Ensures Socket.io real-time multiplayer works perfectly
- **Automatic HTTPS**: Secure connections for all players
- **Global CDN**: Fast asset loading worldwide
- **Zero-Config Deployment**: No complex server setup required
- **Horizontal Scaling**: Handles multiple concurrent games

## 🎨 Asset Credits

### Required Attributions (CC BY 3.0)
- **Jellyfish Sprites**: Created by RAPIDPUNCHES ([OpenGameArt](https://opengameart.org/content/primary-jellies))
- **Heart/Lives Icon**: Created by NicoleMarieProductions ([OpenGameArt](https://opengameart.org/content/heart-1616))

### Public Domain Assets (CC0)
- **Wasp Sprite**: Created by Spring Spring
- **Space Backgrounds**: Created by Screaming Brain Studios  
- **Spaceship Sprites**: Generated using GrokAI

*Full attribution details available in [NOTICE.md](NOTICE.md)*

## 🧰 Technologies

- **Game Engine**: [Phaser.js 3.60+](https://phaser.io/) (MIT License)
- **Multiplayer**: [Socket.io 4.7+](https://socket.io/) (MIT License) 
- **Server**: [Express.js 4.18+](https://expressjs.com/) (MIT License)
- **Runtime**: Node.js 18+
- **Deployment**: [Railway](https://railway.app/) platform
- **Development**: Claude Sonnet 4 + Cursor AI assistance

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

### License Compatibility
- All visual assets are compatible with GPL v3
- Third-party libraries use permissive licenses (MIT)
- Full compliance with Creative Commons attributions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

Please report bugs through GitHub Issues, including:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console error messages

## 🎯 Roadmap

- [ ] Power-ups and weapon upgrades
- [ ] Boss enemies with unique attack patterns
- [ ] Leaderboard system with persistent high scores
- [ ] Mobile touch controls
- [ ] Sound effects and background music
- [ ] Spectator mode for completed games

## 🙏 Acknowledgments

- Inspired by classic arcade shooters like **Decimation X**
- Built with assistance from **Claude Sonnet 4** and **Cursor AI**
- Asset creators from the OpenGameArt community
- The Phaser.js and Socket.io development communities
- Railway platform for seamless deployment

---

*Made with 🚀 AI assistance, 💻 human creativity, and ☕ lots of coffee*
