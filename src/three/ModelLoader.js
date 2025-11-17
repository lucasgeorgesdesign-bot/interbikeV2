import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * ModelLoader - Loads and processes GLB models
 * Maps mesh names to partIds and extracts model metadata
 */
export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader()
  }

  /**
   * Load GLB model and extract part mappings
   * @param {string} modelPath - Path to GLB file
   * @returns {Promise<{scene: THREE.Group, partMap: Map<string, THREE.Mesh>, partIds: string[]}>}
   */
  async loadModel(modelPath) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          const scene = gltf.scene
          const partMap = new Map()
          const partIds = []

          // Traverse scene and map meshes by name
          scene.traverse((child) => {
            if (child.isMesh) {
              const partId = child.name || child.userData.partId
              
              if (partId) {
                partMap.set(partId, child)
                partIds.push(partId)
                
                // Enable shadows
                child.castShadow = true
                child.receiveShadow = true
                
                // Ensure material exists
                if (!child.material) {
                  child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                  })
                }
              }
            }
          })

          resolve({
            scene,
            partMap,
            partIds,
          })
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * Get UV overlay path for a part
   * @param {string} modelId - Model ID
   * @param {string} partId - Part ID
   * @returns {string} Path to UV overlay image
   */
  getUVOverlayPath(modelId, partId) {
    return `/assets/uv_overlays/${modelId}_${partId}.png`
  }

  /**
   * Get default part IDs for a model
   * Common part IDs: front, back, sleeve_left, sleeve_right, collar
   * @param {string} modelId - Model ID
   * @returns {string[]} Default part IDs
   */
  getDefaultPartIds(modelId) {
    // This can be customized per model
    return ['front', 'back', 'sleeve_left', 'sleeve_right']
  }
}

