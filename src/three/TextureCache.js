import * as THREE from 'three'

/**
 * TextureCache - Manages texture reuse to avoid duplicate loads
 * Uses URL as cache key
 */
class TextureCache {
  constructor() {
    this.cache = new Map()
    this.maxSize = 50 // Maximum cached textures
  }

  /**
   * Get texture from cache or create new one
   * @param {string} url - Texture URL or data URL
   * @param {THREE.TextureLoader} loader - Three.js texture loader
   * @returns {Promise<THREE.Texture>}
   */
  async getTexture(url, loader = new THREE.TextureLoader()) {
    if (!url) return null

    // Check cache
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)
      cached.lastUsed = Date.now()
      return cached.texture
    }

    // Create new texture
    const texture = await new Promise((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          texture.needsUpdate = true
          resolve(texture)
        },
        undefined,
        (error) => reject(error)
      )
    })

    // Add to cache
    this.addToCache(url, texture)

    return texture
  }

  /**
   * Get texture from ImageBitmap or Canvas
   * @param {ImageBitmap|HTMLCanvasElement} source - Image source
   * @param {string} key - Cache key (optional)
   * @returns {THREE.CanvasTexture}
   */
  getTextureFromSource(source, key = null) {
    const cacheKey = key || `source_${Date.now()}_${Math.random()}`
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      cached.lastUsed = Date.now()
      return cached.texture
    }

    let texture
    if (source instanceof HTMLCanvasElement) {
      texture = new THREE.CanvasTexture(source)
    } else if (source._canvas) {
      // ImageBitmap-like object with _canvas
      texture = new THREE.CanvasTexture(source._canvas)
    } else {
      // Create canvas from ImageBitmap
      const canvas = document.createElement('canvas')
      canvas.width = source.width
      canvas.height = source.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source, 0, 0)
      texture = new THREE.CanvasTexture(canvas)
    }

    texture.needsUpdate = true
    this.addToCache(cacheKey, texture)

    return texture
  }

  /**
   * Add texture to cache
   * @param {string} key - Cache key
   * @param {THREE.Texture} texture - Texture to cache
   */
  addToCache(key, texture) {
    // Evict oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      texture,
      lastUsed: Date.now(),
    })
  }

  /**
   * Evict oldest texture from cache
   */
  evictOldest() {
    let oldestKey = null
    let oldestTime = Infinity

    for (const [key, value] of this.cache.entries()) {
      if (value.lastUsed < oldestTime) {
        oldestTime = value.lastUsed
        oldestKey = key
      }
    }

    if (oldestKey) {
      const cached = this.cache.get(oldestKey)
      cached.texture.dispose()
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Dispose texture and remove from cache
   * @param {string} key - Cache key
   */
  dispose(key) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)
      cached.texture.dispose()
      this.cache.delete(key)
    }
  }

  /**
   * Clear all cached textures
   */
  clear() {
    for (const [key, cached] of this.cache.entries()) {
      cached.texture.dispose()
    }
    this.cache.clear()
  }
}

// Singleton instance
export const textureCache = new TextureCache()

