/**
 * Wave Management System for ProjectX
 * Handles procedural enemy wave generation for infinite gameplay
 */

class WaveManager {
  constructor() {
    this.currentWave = 1;
    this.enemiesPerWave = 32; // Classic layout has 32 enemies (8x4 rows)
    this.difficultyScaler = 0.1; // How much difficulty increases per wave
    this.waveTransition = false;
    this.waveStartDelay = 2000; // Delay between waves in ms
    
    // Enemy type probabilities that change with waves
    this.enemyTypes = [
      {
        type: 'jellyfish-tiny',
        health: 1,
        points: 10,
        movePattern: 'swooping',
        baseProbability: 0.4 // 40% chance in early waves
      },
      {
        type: 'jellyfish-medium', 
        health: 2,
        points: 20,
        movePattern: 'standard',
        baseProbability: 0.3 // 30% chance
      },
      {
        type: 'jellyfish-large',
        health: 3,
        points: 30,
        movePattern: 'sineWave',
        baseProbability: 0.2 // 20% chance
      },
      {
        type: 'wasp',
        health: 1,
        points: 50,
        movePattern: 'zigzag',
        baseProbability: 0.1 // 10% chance, becomes more common later
      }
    ];
    
    // Formation patterns for variety
    this.formations = [
      'grid', 'vformation', 'diamond', 'wave', 'random', 'columns'
    ];
  }

  /**
   * Generate enemies for the current wave
   * @returns {Array} Array of enemy objects
   */
  generateWave() {
    const enemies = [];
    
    // Wave 1: Use classic layout exactly like the original game
    if (this.currentWave === 1) {
      return this.generateClassicWave1();
    }
    
    // Later waves: Use procedural generation with variations
    const enemyCount = this.getEnemyCountForWave();
    const formation = this.getRandomFormation();
    
    console.log(`[WAVE] Generating wave ${this.currentWave} with ${enemyCount} enemies in ${formation} formation`);
    
    // Generate enemy types based on wave difficulty
    const enemyTypes = this.selectEnemyTypesForWave(enemyCount);
    
    // Position enemies based on formation
    const positions = this.generateFormationPositions(formation, enemyCount);
    
    // Create enemy objects
    for (let i = 0; i < enemyCount; i++) {
      const enemyType = enemyTypes[i];
      const position = positions[i];
      
      enemies.push({
        id: `${enemyType.type}-${this.currentWave}-${i}`,
        type: enemyType.type,
        position: position,
        originalPosition: {...position},
        health: this.getEnemyHealthForWave(enemyType.health),
        points: this.getEnemyPointsForWave(enemyType.points),
        movePattern: enemyType.movePattern,
        moveTimer: i * 50, // Stagger movement slightly
        lastShot: 0,
        waveNumber: this.currentWave
      });
    }
    
    return enemies;
  }

  /**
   * Generate the classic Wave 1 layout exactly like the original game
   * @returns {Array} Array of enemy objects in classic formation
   */
  generateClassicWave1() {
    const enemies = [];
    
    console.log(`[WAVE] Generating classic Wave 1 layout`);
    
    // Wasp row (top row) - 8 wasps at y=80
    for (let i = 0; i < 8; i++) {
      enemies.push({
        id: `wasp-1-${i}`,
        type: 'wasp',
        position: { x: 100 + i * 80, y: 80 },
        originalPosition: { x: 100 + i * 80, y: 80 },
        health: 1,
        points: 50,
        movePattern: 'zigzag',
        moveTimer: i * 100,
        lastShot: 0,
        waveNumber: 1
      });
    }
    
    // Large jellyfish row (second row) - 8 large jellyfish at y=150
    for (let i = 0; i < 8; i++) {
      enemies.push({
        id: `jellyfish-large-1-${i}`,
        type: 'jellyfish-large',
        position: { x: 100 + i * 80, y: 150 },
        originalPosition: { x: 100 + i * 80, y: 150 },
        health: 3,
        points: 30,
        movePattern: 'sineWave',
        moveTimer: i * 100,
        lastShot: 0,
        waveNumber: 1
      });
    }
    
    // Medium jellyfish row (third row) - 8 medium jellyfish at y=220
    for (let i = 0; i < 8; i++) {
      enemies.push({
        id: `jellyfish-medium-1-${i}`,
        type: 'jellyfish-medium',
        position: { x: 100 + i * 80, y: 220 },
        originalPosition: { x: 100 + i * 80, y: 220 },
        health: 2,
        points: 20,
        movePattern: 'standard',
        moveTimer: 0,
        lastShot: 0,
        waveNumber: 1
      });
    }
    
    // Tiny jellyfish row (bottom row) - 8 tiny jellyfish at y=290
    for (let i = 0; i < 8; i++) {
      enemies.push({
        id: `jellyfish-tiny-1-${i}`,
        type: 'jellyfish-tiny',
        position: { x: 100 + i * 80, y: 290 },
        originalPosition: { x: 100 + i * 80, y: 290 },
        health: 1,
        points: 10,
        movePattern: 'swooping',
        moveTimer: i * 150,
        lastShot: 0,
        waveNumber: 1
      });
    }
    
    return enemies;
  }

  /**
   * Check if wave is complete and handle transition
   * @param {Array} currentEnemies - Current enemies array
   * @returns {Object} Wave status and new enemies if applicable
   */
  checkWaveComplete(currentEnemies) {
    if (currentEnemies.length === 0 && !this.waveTransition) {
      return this.startNextWave();
    }
    return { waveComplete: false, newEnemies: null, waveNumber: this.currentWave };
  }

  /**
   * Start the next wave
   * @returns {Object} Wave transition data
   */
  startNextWave() {
    this.waveTransition = true;
    this.currentWave++;
    
    console.log(`[WAVE] Starting wave ${this.currentWave}`);
    
    // Generate new enemies after a delay
    setTimeout(() => {
      this.waveTransition = false;
    }, this.waveStartDelay);
    
    return {
      waveComplete: true,
      newEnemies: this.generateWave(),
      waveNumber: this.currentWave,
      delay: this.waveStartDelay
    };
  }

  /**
   * Calculate enemy count for current wave
   * @returns {number} Number of enemies to spawn
   */
  getEnemyCountForWave() {
    // Start with classic count (32 enemies) and gradually increase
    const baseCount = 32; // Same as classic Wave 1
    const waveBonus = Math.floor((this.currentWave - 1) * 1.5); // Slower increase
    const maxEnemies = 48; // Performance cap
    
    return Math.min(baseCount + waveBonus, maxEnemies);
  }

  /**
   * Select enemy types for the current wave based on difficulty
   * @param {number} count - Number of enemies needed
   * @returns {Array} Array of enemy type objects
   */
  selectEnemyTypesForWave(count) {
    const selectedTypes = [];
    
    for (let i = 0; i < count; i++) {
      const adjustedProbabilities = this.getAdjustedProbabilities();
      const selectedType = this.selectRandomEnemyType(adjustedProbabilities);
      selectedTypes.push(selectedType);
    }
    
    return selectedTypes;
  }

  /**
   * Adjust enemy type probabilities based on current wave
   * @returns {Array} Enemy types with adjusted probabilities
   */
  getAdjustedProbabilities() {
    return this.enemyTypes.map(enemyType => {
      let adjustedProbability = enemyType.baseProbability;
      
      // Make harder enemies more common in later waves
      if (enemyType.type === 'wasp') {
        adjustedProbability += this.currentWave * 0.02; // Wasps become more common
      }
      if (enemyType.type === 'jellyfish-large') {
        adjustedProbability += this.currentWave * 0.015;
      }
      if (enemyType.type === 'jellyfish-tiny') {
        adjustedProbability -= this.currentWave * 0.01; // Tiny enemies become less common
      }
      
      return {
        ...enemyType,
        adjustedProbability: Math.max(0.05, Math.min(0.6, adjustedProbability))
      };
    });
  }

  /**
   * Select random enemy type based on probabilities
   * @param {Array} enemyTypes - Enemy types with probabilities
   * @returns {Object} Selected enemy type
   */
  selectRandomEnemyType(enemyTypes) {
    const totalProbability = enemyTypes.reduce((sum, type) => sum + type.adjustedProbability, 0);
    let random = Math.random() * totalProbability;
    
    for (const enemyType of enemyTypes) {
      random -= enemyType.adjustedProbability;
      if (random <= 0) {
        return enemyType;
      }
    }
    
    // Fallback to first type
    return enemyTypes[0];
  }

  /**
   * Generate formation positions for enemies
   * @param {string} formation - Formation type
   * @param {number} count - Number of positions needed
   * @returns {Array} Array of position objects {x, y}
   */
  generateFormationPositions(formation, count) {
    const positions = [];
    const startX = 50;
    const startY = 80;
    const spacingX = 80;
    const spacingY = 70;
    
    switch (formation) {
      case 'grid':
        return this.generateGridFormation(count, startX, startY, spacingX, spacingY);
      case 'vformation':
        return this.generateVFormation(count, startX, startY, spacingX, spacingY);
      case 'diamond':
        return this.generateDiamondFormation(count, startX, startY, spacingX, spacingY);
      case 'wave':
        return this.generateWaveFormation(count, startX, startY, spacingX, spacingY);
      case 'columns':
        return this.generateColumnFormation(count, startX, startY, spacingX, spacingY);
      default:
        return this.generateRandomFormation(count);
    }
  }

  generateGridFormation(count, startX, startY, spacingX, spacingY) {
    const positions = [];
    
    // For later waves, try to maintain a 4-row structure like the classic layout
    const rows = 4;
    const cols = Math.ceil(count / rows);
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Center the formation if we have fewer enemies in the last row
      const rowEnemies = Math.min(cols, count - row * cols);
      const rowStartX = startX + (cols - rowEnemies) * spacingX / 2;
      
      positions.push({
        x: rowStartX + col * spacingX,
        y: startY + row * spacingY
      });
    }
    
    return positions;
  }

  generateVFormation(count, startX, startY, spacingX, spacingY) {
    const positions = [];
    const center = Math.floor(count / 2);
    
    for (let i = 0; i < count; i++) {
      const offset = Math.abs(i - center);
      positions.push({
        x: startX + i * spacingX,
        y: startY + offset * spacingY * 0.5
      });
    }
    
    return positions;
  }

  generateDiamondFormation(count, startX, startY, spacingX, spacingY) {
    const positions = [];
    const rows = Math.ceil(Math.sqrt(count));
    const center = Math.floor(rows / 2);
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / rows);
      const col = i % rows;
      const offset = Math.abs(row - center);
      
      positions.push({
        x: startX + col * spacingX + offset * (spacingX / 2),
        y: startY + row * spacingY
      });
    }
    
    return positions;
  }

  generateWaveFormation(count, startX, startY, spacingX, spacingY) {
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const waveOffset = Math.sin(angle) * 30;
      
      positions.push({
        x: startX + i * spacingX,
        y: startY + waveOffset
      });
    }
    
    return positions;
  }

  generateColumnFormation(count, startX, startY, spacingX, spacingY) {
    const positions = [];
    const cols = Math.min(8, Math.ceil(count / 6));
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      positions.push({
        x: startX + col * spacingX,
        y: startY + row * spacingY
      });
    }
    
    return positions;
  }

  generateRandomFormation(count) {
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      positions.push({
        x: 100 + Math.random() * 600,
        y: 80 + Math.random() * 200
      });
    }
    
    return positions;
  }

  /**
   * Get random formation type
   * @returns {string} Formation name
   */
  getRandomFormation() {
    return this.formations[Math.floor(Math.random() * this.formations.length)];
  }

  /**
   * Scale enemy health for current wave
   * @param {number} baseHealth - Base health value
   * @returns {number} Scaled health
   */
  getEnemyHealthForWave(baseHealth) {
    const healthBonus = Math.floor(this.currentWave / 3); // Every 3 waves, +1 health
    return baseHealth + healthBonus;
  }

  /**
   * Scale enemy points for current wave
   * @param {number} basePoints - Base points value
   * @returns {number} Scaled points
   */
  getEnemyPointsForWave(basePoints) {
    const pointsMultiplier = 1 + (this.currentWave * 0.1); // 10% more points per wave
    return Math.floor(basePoints * pointsMultiplier);
  }

  /**
   * Get current wave number
   * @returns {number} Current wave
   */
  getCurrentWave() {
    return this.currentWave;
  }

  /**
   * Reset wave manager for new game
   */
  reset() {
    this.currentWave = 1;
    this.waveTransition = false;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WaveManager;
} else {
  window.WaveManager = WaveManager;
} 