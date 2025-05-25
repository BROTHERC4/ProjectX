// ObjectPool.js
// Reusable object pool for Phaser sprites

class ObjectPool {
  /**
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {string} key - The texture key for the sprite
   * @param {number} initialSize - Initial pool size
   * @param {number} [maxSize] - Maximum pool size (optional)
   */
  constructor(scene, key, initialSize = 20, maxSize = Infinity) {
    this.scene = scene;
    this.key = key;
    this.initialSize = initialSize;
    this.maxSize = maxSize;

    this.inactivePool = [];
    this.activeObjects = []; // Keep track of active objects

    for (let i = 0; i < initialSize; i++) {
      const obj = this.scene.physics.add.sprite(-1000, -1000, key); // Position off-screen
      obj.setActive(false).setVisible(false);
      this.inactivePool.push(obj);
    }
  }

  /**
   * Get an object from the pool and activate it at (x, y)
   */
  get(x, y) {
    let obj;
    if (this.inactivePool.length > 0) {
      obj = this.inactivePool.pop();
    } else if (this.activeObjects.length < this.maxSize) {
      // Optionally create a new object if pool is empty but maxSize not reached
      obj = this.scene.physics.add.sprite(x, y, this.key);
      // Ensure new objects are also added to physics group if necessary for collision
      // For example, if your bullets need to collide with a group, add them here.
      // this.scene.bullets.add(obj); // Or whatever group they belong to
    } else {
      console.warn(`ObjectPool for key "${this.key}" has reached its maximum size of ${this.maxSize}.`);
      return null; // Pool is empty and max size reached
    }

    if (obj) {
      obj.setActive(true).setVisible(true).setPosition(x, y);
      // Ensure velocity is reset if physics objects are reused
      if (obj.body) {
          obj.body.setVelocity(0, 0);
          obj.body.setAllowGravity(false); // Or true, depending on your needs
      }
      this.activeObjects.push(obj);
      return obj;
    }
    return null; // Should not happen if logic is correct
  }

  /**
   * Release an object back to the pool
   */
  release(obj) {
    if (!obj) return;

    const index = this.activeObjects.indexOf(obj);
    if (index !== -1) {
      this.activeObjects.splice(index, 1);
    } else {
      // If object wasn't in activeObjects, it might have been released already or is foreign
      // console.warn("ObjectPool: Attempted to release an object not found in activeObjects.", obj);
    }

    obj.setActive(false).setVisible(false);
    obj.setPosition(-1000, -1000); // Move far off-screen
    if (obj.body) {
      obj.body.setVelocity(0, 0); // Stop any movement
      obj.body.setEnable(false); // Disable physics body until re-enabled in get()
    }
    
    if (this.inactivePool.length < this.maxSize) { // Optional: control pool growth
        this.inactivePool.push(obj);
    } else {
        // If inactive pool is full (e.g. due to maxSize for inactive objects), destroy it
        obj.destroy();
    }
  }

  /**
   * Release all active objects back to the pool
   */
  releaseAll() {
    // Iterate backwards because release() modifies the activeObjects array
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      this.release(this.activeObjects[i]);
    }
  }

  /**
   * Get all active objects.
   * @returns {Phaser.GameObjects.Sprite[]}
   */
  getActiveObjects() {
    return this.activeObjects;
  }

  /**
  * Pre-fills the pool with a specified number of objects.
  * @param {number} count - The number of objects to add to the pool.
  */
  preFill(count) {
    for (let i = 0; i < count; i++) {
      if (this.inactivePool.length + this.activeObjects.length < this.maxSize) {
        const obj = this.scene.physics.add.sprite(-1000, -1000, this.key);
        obj.setActive(false).setVisible(false);
        if (obj.body) {
            obj.body.setEnable(false);
        }
        this.inactivePool.push(obj);
      } else {
        break; // Stop if max size is reached
      }
    }
  }

  /**
   * Clears all objects from the pool (both active and inactive) and destroys them.
   * Useful for scene shutdown.
   */
  clearAll() {
    this.activeObjects.forEach(obj => obj.destroy());
    this.activeObjects.length = 0;
    this.inactivePool.forEach(obj => obj.destroy());
    this.inactivePool.length = 0;
  }

  countActive() {
    return this.activeObjects.length;
  }

  countInactive() {
    return this.inactivePool.length;
  }
}

window.ObjectPool = ObjectPool; 