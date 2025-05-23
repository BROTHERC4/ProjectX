# ProjectX Game Design Document
*Note: This document outlines the development plan for ProjectX, a game inspired by Decimation X*

To recreate *ProjectX* as a multiplayer browser game with a retro 8-bit aesthetic, I've refined the game design based on the provided YouTube gameplay video ([Decimation X Gameplay](https://www.youtube.com/watch?v=ChlLzWIiINo)), your goal to replicate its look and gameplay, and the previous responses. This response provides a detailed game design and a verbal development plan without code examples, focusing on how to structure the code and connect the server and client using **Phaser**, **Socket.io**, **Express.js**, **Railway**, and **Cursor AI** (assumed to be an AI-assisted coding tool like [Cursor](https://cursor.sh/)). The plan emphasizes multiplayer synchronization and modular code organization for a 2D shoot 'em up (shmup) game.

### Game Design Specifications
*ProjectX* is a fast-paced, fixed-gallery shmup where up to four players control ships at the screen's bottom, moving horizontally and firing at descending enemy waves. The game features intense shooting, power-ups, and increasing difficulty, with a retro 8-bit aesthetic. The multiplayer browser version should replicate these elements with real-time synchronization.

#### Core Mechanics
- **Player Controls**:
  - Players move their ships left or right using arrow keys or WASD, with each player assigned unique keys for multiplayer support.
  - Pressing a fire key (e.g., spacebar) shoots bullets upwards continuously.
  - Each player's ship has a distinct appearance, such as different colors or sprite designs, to differentiate them.
- **Enemies**:
  - Enemies spawn in waves at the top, arranged in grids (e.g., 5 columns by 3 rows) or other patterns.
  - They move in synchronized patterns, such as sliding left-right, zig-zagging, or slowly descending toward the players.
  - Some enemies shoot projectiles downward at random intervals.
  - Later waves introduce tougher enemies with more health or shields (requiring multiple hits) and occasional boss enemies with unique attack patterns, like rapid-fire barrages or wide-area shots.
- **Shooting**:
  - Players fire rapid single shots by default, with bullets traveling straight up.
  - Power-ups modify shooting, such as adding triple shots (three bullets in a spread), increasing fire rate, or switching to powerful laser beams.
  - The server validates bullet-enemy and enemy-player collisions to ensure fair play.
- **Power-ups**:
  - Destroyed enemies have a small chance (e.g., 5-10%) to drop power-ups that float downward.
  - Power-up types include faster shooting, spread shots, temporary shields (block one hit), speed boosts for movement, or extra lives.
  - Uncollected power-ups disappear after a few seconds.
- **Progressive Defenses**:
  - As waves progress, enemies gain defenses, such as shields that absorb a set number of hits or increased health points.
  - Boss enemies, appearing every few waves, have higher health and complex attacks, requiring coordinated player effort to defeat.
- **Scoring**:
  - Players earn points for destroying enemies: small enemies give low points, shielded enemies give more, and bosses award significant points.
  - Completing a wave without losing lives grants a score multiplier.
  - A shared high-score leaderboard tracks top scores across all players in the room.
- **Lives**:
  - Each player starts with three lives, losing one when hit by an enemy or projectile.
  - If all players lose all lives, the game ends, displaying scores and offering a restart or return to the lobby.

#### Multiplayer Features
- **Game Rooms**:
  - A lobby interface allows players to create a new game room or join an existing one using a room code or public/private settings.
  - Each room supports up to four players, who play cooperatively in the same game instance.
- **Synchronization**:
  - The server maintains the authoritative game state, including player positions, enemy states, bullets, power-ups, and scores.
  - Clients send player inputs (movement direction, fire button state) to the server, which processes them and broadcasts updated game state to all clients in the room.
  - Updates occur frequently (e.g., 60 times per second) to ensure smooth gameplay.
- **Player Interaction**:
  - All players' ships appear on the same screen, positioned at the bottom, spaced to avoid overlap.
  - Friendly fire is disabled to focus on cooperation.
  - Power-ups are collected by the first player to touch them, adding a competitive element within the cooperative framework.

#### Visuals
- **Art Style**: Retro 8-bit pixel art for ships, enemies, bullets, power-ups, and backgrounds, mimicking the vibrant, blocky look of *Decimation X*.
- **Background**: A static starfield or subtly scrolling space scene to enhance the retro space theme without distracting from gameplay.
- **Effects**: Visual effects include pixelated explosions when enemies are destroyed, sparks or flashes for bullet impacts, and glowing animations when collecting power-ups.
- **UI**:
  - Top-left corner shows each player's score.
  - Bottom of the screen displays lives as small ship icons under each player's position.
  - Top-center shows the current wave number and the room's high score.
- **Resolution**: Target 800x600 pixels, with scaling options to maintain crisp pixel art on modern browsers.

#### Audio
- **Sound Effects**: Retro 8-bit sounds for shooting, enemy explosions, power-up collection, and player damage.
- **Music**: A looping chiptune soundtrack with an energetic, retro vibe, similar to Imphenzia's music in *Decimation X*.
- **Sources**: Free audio assets from repositories like Freesound.org or OpenGameArt.org, ensuring compatibility with project licensing.

### Technology Stack
The stack remains as recommended previously, tailored to *Decimation X*'s needs:
- **Phaser**: A 2D game framework for rendering sprites, handling collisions, and managing game scenes, ideal for shmups due to its built-in features.
- **Socket.io**: Facilitates real-time multiplayer by enabling WebSocket communication between clients and the server for input and state updates.
- **Express.js**: A Node.js framework to serve the game's static files and handle API requests, such as room creation or joining.
- **Railway**: A deployment platform for hosting the Node.js server and static game files, supporting WebSocket for Socket.io.
- **Cursor AI**: An AI coding assistant to generate code snippets, suggest structures, and debug issues, speeding up development.

### Development Plan
This verbal plan outlines how to structure the code, connect the server and client, and leverage Cursor AI, focusing on modularity and multiplayer synchronization. The project is estimated to take 2-3 weeks part-time, assuming familiarity with JavaScript.

#### Step 1: Project Setup (1-2 Days)
- **Objective**: Establish a modular project structure and install dependencies.
- **Tasks**:
  - Set up a Node.js project with a clear directory structure: a `server` folder for backend logic, a `client` folder for Phaser game code, and a `public` folder for static files like HTML, CSS, and assets.
  - Install core dependencies: Express.js for the server, Socket.io for real-time communication, and Phaser for the game framework. Add nodemon for development to auto-restart the server on changes.
  - Create a minimal Express server in the `server` folder to serve static files from `public` and initialize Socket.io for WebSocket connections.
  - Set up a basic HTML file in `public` to load Phaser and establish a blank game canvas, ensuring it connects to the server via Socket.io.
  - Structure the client code into modules: one for game scenes (e.g., menu, gameplay), one for Socket.io communication, and one for asset loading.
- **Server-Client Connection**:
  - The server listens for Socket.io connections and logs new clients.
  - The client includes the Socket.io client library and connects to the server's WebSocket endpoint upon loading the HTML page.
- **Cursor AI Use**: Ask Cursor AI to suggest a modular Node.js project structure with Express, Socket.io, and Phaser, ensuring separate folders for server and client logic.

#### Step 2: Backend Development (3-5 Days)
- **Objective**: Build a server to manage game rooms, process game logic, and synchronize state.
- **Tasks**:
  - Organize the server code into modules: one for Socket.io event handlers, one for game state management, and one for game logic (e.g., enemy spawning, collisions).
  - Implement game room functionality: Allow clients to create or join rooms, storing each room's state (players, enemies, power-ups) in memory.
  - Define the game state structure: Track players (position, lives, score), enemies (position, health, type), bullets (position, owner), power-ups (position, type), and wave number.
  - Create a game loop running at 60 FPS to update the state: Move enemies according to patterns, spawn new waves periodically, check collisions, and manage power-up spawns.
  - Handle client inputs: Process movement (left/right) and shooting commands, updating the player's position and creating bullets as needed.
  - Broadcast the updated game state to all clients in a room after each loop iteration.
- **Server-Client Connection**:
  - Clients send input events (e.g., "move left," "shoot") to the server via Socket.io.
  - The server validates inputs, updates the game state, and emits a "game state" event to all clients in the room, containing the full state (players, enemies, etc.).
  - Clients listen for the "game state" event and update their local rendering accordingly.
- **Code Structure**:
  - Create a `gameState.js` module to define and update the game state.
  - Use a `socketHandlers.js` module to manage Socket.io events (connect, disconnect, input, join room).
  - Implement a `gameLogic.js` module for enemy patterns, collision detection, and power-up spawning.
  - Keep the main `server.js` file minimal, initializing Express and Socket.io and importing modules.
- **Cursor AI Use**: Request Cursor AI to outline server-side logic for managing game rooms, handling player inputs, and broadcasting game state, ensuring modularity.

#### Step 3: Frontend Development (5-7 Days)
- **Objective**: Develop the Phaser game with multiplayer integration and a lobby interface.
- **Tasks**:
  - Structure the client code into modules: one for Phaser scenes, one for Socket.io communication, one for input handling, and one for UI components.
  - Create three Phaser scenes: a "Menu" scene for the lobby, a "Game" scene for gameplay, and a "GameOver" scene for final scores.
  - In the "Menu" scene, build a simple UI with buttons to host or join a game room, including an input field for room codes.
  - In the "Game" scene, render the game based on server state: Display player ships, enemies, bullets, and power-ups as sprites, and update their positions each frame.
  - Handle player inputs: Capture keyboard events for movement and shooting, sending them to the server via Socket.io.
  - Implement UI elements: Show scores in the top-left, lives as icons at the bottom, and wave number at the top-center.
  - Add enemy wave patterns, such as grid-based movements or zig-zags, driven by server updates.
  - Apply power-up effects, like changing the bullet sprite or firing rate, when the server indicates a power-up is collected.
- **Server-Client Connection**:
  - The client connects to the server on page load, joining a room by emitting a "join room" event with a room code.
  - For inputs, the client sends movement (e.g., "move left 5 pixels") and shooting (e.g., "fire pressed") events to the server.
  - The client listens for "game state" events from the server, updating sprite positions and UI to reflect the latest state.
  - The server ensures all clients in a room receive consistent state updates, maintaining synchronization.
- **Code Structure**:
  - Create a `scenes/` folder with separate files for each Phaser scene (e.g., `menuScene.js`, `gameScene.js`).
  - Use a `socketClient.js` module to handle Socket.io connections and events (e.g., join room, send input, receive state).
  - Implement an `inputHandler.js` module to process keyboard inputs and map them to server events.
  - Store UI logic in a `ui.js` module for rendering scores, lives, and wave numbers.
- **Cursor AI Use**: Ask Cursor AI to suggest a modular Phaser structure with scenes for a shmup, including Socket.io integration for multiplayer and UI components.

#### Step 4: Asset Integration (2-3 Days)
- **Objective**: Add 8-bit assets to replicate *Decimation X*'s aesthetic.
- **Tasks**:
  - Source free 8-bit pixel art from platforms like itch.io, targeting sprites for player ships (four distinct designs), enemies (drones, shielded enemies, bosses), bullets, and power-up icons.
  - Optionally create custom sprites using a pixel art tool like Aseprite if specific designs are needed.
  - Find retro 8-bit sound effects for shooting, explosions, and power-up collection, and a chiptune soundtrack from sources like Freesound.org or OpenGameArt.org.
  - Organize assets in a `public/assets/` folder, with subfolders for sprites, audio, and other resources.
  - In the client code, create an asset loading module to preload sprites and audio in Phaser's preload phase, making them available for scenes.
- **Server-Client Connection**:
  - Assets are client-side, so no server interaction is needed here.
  - The client loads assets during the game's initialization, and the server indirectly influences visuals by sending state data (e.g., which enemy type to render).
- **Code Structure**:
  - Create an `assetLoader.js` module to handle Phaser's preload phase, loading all sprites and audio.
  - Reference assets in scene modules (e.g., `gameScene.js`) when creating sprites or playing sounds.
- **Cursor AI Use**: Request Cursor AI to outline a Phaser asset loading module for 8-bit sprites and audio, ensuring proper organization.

#### Step 5: Testing and Debugging (3-5 Days)
- **Objective**: Ensure gameplay, multiplayer sync, and performance are robust.
- **Tasks**:
  - Test locally by running the server and opening multiple browser tabs to simulate players.
  - Verify core mechanics: Player movement, shooting, enemy waves, power-up effects, scoring, and lives.
  - Check multiplayer synchronization: Ensure all clients see the same positions for ships, enemies, and bullets.
  - Test edge cases: Players joining/leaving mid-game, network delays, or high enemy counts.
  - Add mobile support if desired, implementing touch controls (e.g., virtual joystick for movement, button for shooting).
  - Debug issues like desync (players seeing different states) or performance lag (e.g., too many sprites) using browser developer tools and server logs.
- **Server-Client Connection**:
  - Test the Socket.io connection by simulating packet loss or high latency to ensure state updates remain consistent.
  - Verify that the server correctly handles rapid inputs and broadcasts state without overwhelming clients.
- **Code Structure**:
  - Add a `tests/` folder with manual test scripts or notes for multiplayer scenarios.
  - Keep debug logging in server and client modules to track state mismatches or errors.
- **Cursor AI Use**: Ask Cursor AI to suggest debugging strategies for Phaser multiplayer desync or performance optimization for 60 FPS rendering.

#### Step 6: Deployment on Railway (1-2 Days)
- **Objective**: Deploy the game to a live server for public access.
- **Tasks**:
  - Push the project to a GitHub repository for version control and deployment.
  - Set up a Railway project, linking it to the GitHub repository.
  - Configure the server to use a dynamic port (provided by Railway's environment) and ensure Socket.io's WebSocket connections work by setting appropriate CORS policies.
  - Organize the deployment setup: The `public` folder hosts the client's HTML, Phaser code, and assets, while the `server` folder runs the Express and Socket.io backend.
  - Test the deployed game by accessing it in multiple browsers, verifying multiplayer functionality and asset loading.
- **Server-Client Connection**:
  - The client connects to the deployed server's WebSocket endpoint (e.g., `wss://your-game.up.railway.app`).
  - The server continues to handle inputs and broadcast state, with Railway ensuring reliable WebSocket support.
- **Code Structure**:
  - Add a `deploy.js` or documentation file outlining Railway setup steps.
  - Ensure the main `server.js` file uses environment variables for portability.
- **Cursor AI Use**: Request Cursor AI to describe a Railway deployment process for a Node.js app with Socket.io, focusing on WebSocket configuration.

### Server-Client Connection Summary
- **Initialization**: The client loads the HTML page, includes the Socket.io client library, and connects to the server's WebSocket endpoint. The server accepts connections and assigns each client a unique ID.
- **Room Management**: Clients send a "join room" event with a room code. The server assigns them to the specified room, initializing their player data (position, lives).
- **Input Handling**: Clients send input events (movement, shooting) to the server whenever keys are pressed. The server processes these, updating the game state (e.g., moving a player, creating a bullet).
- **State Synchronization**: The server runs a 60 FPS loop, updating enemy positions, checking collisions, and spawning power-ups. After each update, it broadcasts the full game state to all clients in the room.
- **Rendering**: Clients receive the game state and update Phaser sprites to match, ensuring all players see the same game world. The client only handles rendering and input capture, relying on the server for logic.
- **Disconnection**: If a client disconnects, the server removes their player from the room's state and notifies other clients to update their rendering.

### Code Structure Overview
- **Server**:
  - `server.js`: Main entry point, initializes Express and Socket.io, imports modules.
  - `gameState.js`: Defines and manages the game state (players, enemies, power-ups).
  - `socketHandlers.js`: Handles Socket.io events (connect, input, join room).
  - `gameLogic.js`: Implements game mechanics (enemy movement, collisions, power-ups).
- **Client**:
  - `public/index.html`: Loads Phaser, Socket.io client, and game scripts.
  - `client/scenes/`: Contains Phaser scenes (`menuScene.js`, `gameScene.js`, `gameOverScene.js`).
  - `client/socketClient.js`: Manages Socket.io connections and events.
  - `client/inputHandler.js`: Captures and sends keyboard inputs.
  - `client/ui.js`: Renders UI elements (scores, lives, wave number).
  - `client/assetLoader.js`: Preloads sprites and audio for Phaser.
- **Assets**: Stored in `public/assets/`, with subfolders for sprites and audio.

### Timeline
- **Total**: 2-3 weeks (part-time).
- **Breakdown**:
  - Setup: 1-2 days.
  - Backend: 3-5 days.
  - Frontend: 5-7 days.
  - Assets: 2-3 days.
  - Testing: 3-5 days.
  - Deployment: 1-2 days.

### Challenges and Mitigations
- **Latency**: Use a server-authoritative model to prevent cheating. Optimize state updates by sending only changed data (deltas) if performance lags.
- **Asset Licensing**: Source assets from reputable platforms (itch.io, OpenGameArt.org) and verify they allow commercial or non-commercial use.
- **Performance**: Limit active sprites (e.g., reuse bullets via pooling) and test on low-end devices to maintain 60 FPS.
- **Mobile Support**: Optionally add touch controls (virtual joystick, fire button) and ensure the game scales responsively for smaller screens.

### Citations
- [Decimation X Gameplay Video](https://www.youtube.com/watch?v=ChlLzWIiINo)
- [Phaser Official Documentation](https://phaser.io/)
- [Socket.io Official Documentation](https://socket.io/)
- [Express.js Official Documentation](https://expressjs.com/)
- [Railway Official Documentation](https://railway.app/)
- [itch.io Free 8-bit Assets](https://itch.io/game-assets/free/tag-8-bit)
- [OpenGameArt.org](https://opengameart.org/)
- [Freesound.org](https://freesound.org/)

This verbal game design and development plan provides a clear roadmap to recreate *ProjectX* as a multiplayer browser game, with a focus on modular code structure and server-client synchronization. Let me know if you need further details or specific guidance on any step!