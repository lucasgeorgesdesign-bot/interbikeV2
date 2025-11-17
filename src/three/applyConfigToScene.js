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
  // Load model config to get design textures
  const modelConfig = await modelLoader.loadModelConfig(modelId)
  const currentDesign = modelConfig?.designs?.[0] // Pour l'instant, prendre le premier design (camouflage)
  
  // Get all partIds from both partMap (meshes in GLB) and parts (Redux state)
  // This ensures we process all parts even if some meshes are missing
  const partMapIds = Array.from(partMap.keys())
  const partsIds = Object.keys(parts)
  const allPartIds = [...new Set([...partMapIds, ...partsIds])]
  
  console.log('🎨 Applying config to scene:')
  console.log('  - PartMap IDs (from GLB):', partMapIds)
  console.log('  - Parts IDs (from Redux):', partsIds)
  console.log('  - All partIds to process:', allPartIds)
  
  let completed = 0

  for (const partId of allPartIds) {
    const materialRef = partMap.get(partId)
    const partCfg = parts[partId] || {}

    if (!materialRef || !materialRef.mesh || !materialRef.material) {
      console.warn(`⚠️ No material reference found for partId "${partId}", skipping texture composition`)
      completed++
      if (onProgress) onProgress(completed, allPartIds.length)
      continue
    }

    const { mesh, material } = materialRef

    console.log(`  Processing ${partId}:`, {
      hasMesh: !!mesh,
      hasMaterial: !!material,
      materialName: materialRef.materialName,
      hasPartCfg: Object.keys(partCfg).length > 0,
      hasNumber: !!partCfg.number,
      hasText: !!partCfg.text,
      hasLogo: !!partCfg.logoId || !!partCfg.imageUrl,
    })

    try {
      // Always compose texture to include user modifications (text, numbers, logos)
      // Even if we have a base texture, we need to compose it with user elements
      const baseTextureUrl = currentDesign?.baseTextures?.[partId]
      
      // If we have a base texture, we'll use it as background in the composer
      // Otherwise, compose normally
      const uvOverlay = modelLoader.getUVOverlayPath(modelId, partId)

      // Prepare partCfg with base texture if available
      const partCfgWithBase = {
        ...partCfg,
        // If base texture exists, use it as textureUrl for the composer
        textureUrl: baseTextureUrl || partCfg.textureUrl,
      }

      // Compose texture (will include base texture + user elements)
      const { blob, canvas } = await composePart(partCfgWithBase, uvOverlay, {
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
      if (material.map) {
        const oldTexture = material.map
        if (oldTexture !== texture) {
          oldTexture.dispose()
        }
      }

      // Apply texture to the specific material
      material.map = texture
      material.needsUpdate = true

      // Clean up ImageBitmap if needed
      if (imageBitmap.close) {
        setTimeout(() => {
          try {
            imageBitmap.close()
          } catch (e) {
            // Ignore
          }
        }, 1000)
      }
      
      if (baseTextureUrl) {
        console.log(`✅ Composed texture for ${partId} with base texture + user elements`)
      } else {
        console.log(`✅ Composed texture for ${partId}`)
      }
      
      // Log what was included in the composition
      if (partCfg.number) {
        console.log(`  📍 Number "${partCfg.number.value}" at (${partCfg.number.xPercent}%, ${partCfg.number.yPercent}%)`)
      }
      if (partCfg.text) {
        console.log(`  📝 Text "${partCfg.text.value}" at (${partCfg.text.xPercent}%, ${partCfg.text.yPercent}%)`)
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

