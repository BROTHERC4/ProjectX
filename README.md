# ProjectX Multiplayer

A multiplayer space shooter game built with Phaser.js, Socket.io, and Express.js.

## Features

- Cooperative multiplayer space shooter
- Real-time gameplay synchronized across clients
- Multiple enemy types with different movement patterns and attacks
- Barriers for protection against enemy fire
- Score tracking and competitive gameplay
- Lobby system for game creation and joining

## Prerequisites

- Node.js v14+ and npm

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/project-x-multiplayer.git
   cd project-x-multiplayer
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Game

### Development Mode

Run the server in development mode with automatic restart on file changes:

```
npm run dev
```

### Production Mode

Start the server in production mode:

```
npm start
```

Then open your browser and navigate to `http://localhost:3000` to play the game.

## How to Play

1. **Main Menu**:
   - Create a new game to host a multiplayer session
   - Join an existing game with a room code
   - Play single-player mode

2. **In-Game Controls**:
   - Left/Right arrow keys: Move your ship
   - Spacebar: Fire weapon

3. **Game Objective**:
   - Destroy all enemies before they reach the bottom of the screen
   - Protect your ship using barriers
   - Compete with other players for the highest score

## Project Structure

```
project-x-multiplayer/
├── server.js              # Main server entry point
├── gameState.js           # Server-side game state management
├── roomManager.js         # Multiplayer room management
├── public/                # Client-side files
│   ├── index.html         # Main HTML file
│   ├── assets/            # Game assets (images, sounds, etc.)
│   └── js/                # Client-side JavaScript
│       ├── game.js        # Phaser game initialization
│       ├── socket-client.js # Socket.io client
│       └── scenes/        # Phaser scenes
│           ├── menu.js    # Menu scene
│           ├── lobby.js   # Lobby scene
│           ├── start.js   # Main game scene
│           └── game-over.js # Game over scene
└── package.json           # Project dependencies
```

## Deployment to Railway

### Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli)
- Railway account

### Steps

1. Login to Railway:
   ```
   railway login
   ```

2. Initialize Railway project:
   ```
   railway init
   ```

3. Deploy to Railway:
   ```
   railway up
   ```

4. Set up environment variables (if needed):
   ```
   railway variables set KEY=VALUE
   ```

5. Open deployed application:
   ```
   railway open
   ```

## License

MIT

## Credits

### Assets
- Wasp sprite by [Spring Spring](https://opengameart.org/content/wasp-0) (CC0 1.0)
- Jellyfish sprites by [rapidpunches](https://opengameart.org/content/primary-jellies) (CC BY-SA 4.0)
- Space background from Phaser setup
- Spaceship sprites generated using GrokAI

### Technologies
- Built with [Phaser.js](https://phaser.io/)
- Multiplayer functionality with [Socket.io](https://socket.io/)
- Server powered by [Express.js](https://expressjs.com/)
