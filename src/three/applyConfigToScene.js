import * as THREE from 'three'
import { composePart } from './OffscreenComposer.js'
import { textureCache } from './TextureCache.js'
import { createImageBitmapFromBlob } from '../utils/createImageBitmapFromBlob.js'
import { ModelLoader } from './ModelLoader.js'

const modelLoader = new ModelLoader()

/**
 * Dispose scene and all its resources
 */
function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.isMesh) {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => disposeMaterial(mat))
        } else {
          disposeMaterial(object.material)
        }
      }
    }
  })
}

/**
 * Dispose material and its textures
 */
function disposeMaterial(material) {
  if (material.map) {
    material.map.dispose()
  }
  if (material.normalMap) {
    material.normalMap.dispose()
  }
  if (material.roughnessMap) {
    material.roughnessMap.dispose()
  }
  if (material.metalnessMap) {
    material.metalnessMap.dispose()
  }
  material.dispose()
}

// Debounce composition to avoid excessive recomputation
let compositionTimeout = null
const COMPOSITION_DEBOUNCE_MS = 200

/**
 * Apply configuration to scene - main entry point
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Map<string, THREE.Mesh>} partMap - Map of partId to mesh
 * @param {Object} parts - Redux parts state
 * @param {string} modelId - Model ID
 * @param {Function} onProgress - Progress callback
 */
export async function applyConfigToScene(scene, partMap, parts, modelId, onProgress = null) {
  // Clear debounce timeout
  if (compositionTimeout) {
    clearTimeout(compositionTimeout)
  }

  return new Promise((resolve) => {
    compositionTimeout = setTimeout(async () => {
      try {
        await applyConfigToSceneImmediate(scene, partMap, parts, modelId, onProgress)
        resolve()
      } catch (error) {
        console.error('Error applying config to scene:', error)
        resolve()
      }
    }, COMPOSITION_DEBOUNCE_MS)
  })
}

/**
 * Apply configuration immediately (called after debounce)
 */
async function applyConfigToSceneImmediate(scene, partMap, parts, modelId, onProgress) {
  const partIds = Array.from(partMap.keys())
  let completed = 0

  for (const partId of partIds) {
    const mesh = partMap.get(partId)
    const partCfg = parts[partId]

    if (!mesh || !partCfg) {
      completed++
      if (onProgress) onProgress(completed, partIds.length)
      continue
    }

    try {
      // Get UV overlay path
      const uvOverlay = modelLoader.getUVOverlayPath(modelId, partId)

      // Compose texture
      const { blob, canvas } = await composePart(partCfg, uvOverlay, {
        width: 1024,
        height: 1024,
        quality: 1,
      })

      // Create ImageBitmap for fast GPU upload
      const imageBitmap = await createImageBitmapFromBlob(blob)

      // Get or create texture from cache
      let texture
      if (imageBitmap._canvas) {
        texture = textureCache.getTextureFromSource(imageBitmap._canvas, `part_${partId}_${Date.now()}`)
      } else {
        texture = textureCache.getTextureFromSource(imageBitmap, `part_${partId}_${Date.now()}`)
      }

      // Dispose old texture if exists
      if (mesh.material && mesh.material.map) {
        const oldTexture = mesh.material.map
        // Don't dispose if it's the same texture (from cache)
        if (oldTexture !== texture) {
          oldTexture.dispose()
        }
      }

      // Create or update material
      if (!mesh.material) {
        mesh.material = new THREE.MeshStandardMaterial()
      }

      mesh.material.map = texture
      mesh.material.needsUpdate = true

      // Clean up ImageBitmap if needed
      if (imageBitmap.close) {
        // Don't close immediately, let Three.js use it
        setTimeout(() => {
          try {
            imageBitmap.close()
          } catch (e) {
            // Ignore
          }
        }, 1000)
      }
    } catch (error) {
      console.error(`Error applying texture to part ${partId}:`, error)
    }

    completed++
    if (onProgress) onProgress(completed, partIds.length)
  }
}

// Export disposeScene for use in SceneManager
export { disposeScene }

