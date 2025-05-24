// ObjectPool.js
// Reusable object pool for Phaser sprites

export class ObjectPool {
  /**
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {string} key - The texture key for the sprite
   * @param {number} maxSize - Maximum pool size
   */
  constructor(scene, key, maxSize = 20) {
    this.scene = scene;
    this.key = key;
    this.pool = [];
    for (let i = 0; i < maxSize; i++) {
      const obj = scene.physics.add.sprite(-100, -100, key).setActive(false).setVisible(false);
      this.pool.push(obj);
    }
  }

  /**
   * Get an object from the pool and activate it at (x, y)
   */
  get(x, y) {
    const obj = this.pool.find(o => !o.active);
    if (obj) {
      obj.setActive(true).setVisible(true).setPosition(x, y);
      return obj;
    }
    return null;
  }

  /**
   * Release an object back to the pool
   */
  release(obj) {
    obj.setActive(false).setVisible(false);
    obj.setPosition(-100, -100);
  }

  /**
   * Release all objects in the pool
   */
  releaseAll() {
    this.pool.forEach(obj => this.release(obj));
  }
}

window.ObjectPool = ObjectPool; 