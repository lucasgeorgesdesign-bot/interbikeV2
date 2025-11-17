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
   * Uses model config to map mesh names to partIds
   * @param {string} modelPath - Path to GLB file
   * @param {string} modelId - Model ID to load config
   * @returns {Promise<{scene: THREE.Group, partMap: Map<string, THREE.Mesh>, partIds: string[]}>}
   */
  async loadModel(modelPath, modelId = null) {
    return new Promise(async (resolve, reject) => {
      // Load model config first to get mesh name mappings
      let meshNameToPartId = new Map()
      if (modelId) {
        const config = await this.loadModelConfig(modelId)
        if (config && config.zones) {
          config.zones.forEach(zone => {
            if (zone.meshName && zone.partId) {
              meshNameToPartId.set(zone.meshName, zone.partId)
              console.log(`📋 Mapping config: mesh "${zone.meshName}" -> partId "${zone.partId}"`)
            }
          })
        }
      }

      this.loader.load(
        modelPath,
        (gltf) => {
          const scene = gltf.scene
          const partMap = new Map()
          const partIds = []
          const allMeshes = []

          // First pass: collect all meshes
          scene.traverse((child) => {
            if (child.isMesh) {
              allMeshes.push(child)
              
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
          })

          console.log(`📦 Found ${allMeshes.length} meshes in GLB`)
          
          // Log all mesh names for debugging
          const allMeshNames = allMeshes.map(m => m.name).filter(Boolean)
          console.log(`📋 All mesh names in GLB:`, allMeshNames)

          // Collect all materials for mapping
          const allMaterials = new Set()
          allMeshes.forEach(mesh => {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            materials.forEach(mat => {
              if (mat && mat.name) allMaterials.add(mat.name)
            })
          })
          console.log(`📋 All materials in GLB:`, Array.from(allMaterials))

          // Second pass: map materials to partIds using config
          if (meshNameToPartId.size > 0) {
            // Use config mapping (meshName in config actually refers to material name)
            const materialToPartId = new Map()
            const partIdToMaterialRef = new Map()
            
            allMeshes.forEach((mesh) => {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
              
              materials.forEach((material, index) => {
                if (material && material.name) {
                  const materialName = material.name
                  const partId = meshNameToPartId.get(materialName)
                  
                  if (partId) {
                    materialToPartId.set(materialName, partId)
                    partIdToMaterialRef.set(partId, {
                      mesh: mesh,
                      material: material,
                      materialIndex: index,
                      materialName: materialName
                    })
                    console.log(`✅ Mapped material "${materialName}" -> partId "${partId}"`)
                  }
                }
              })
            })
            
            // Create partMap entries
            partIdToMaterialRef.forEach((ref, partId) => {
              partMap.set(partId, ref)
              partIds.push(partId)
            })
            
            // Warn if some expected materials are missing
            const expectedMaterials = Array.from(meshNameToPartId.keys())
            const foundMaterials = Array.from(allMaterials)
            const missingMaterials = expectedMaterials.filter(name => !foundMaterials.includes(name))
            if (missingMaterials.length > 0) {
              console.warn(`⚠️ Expected materials not found in GLB:`, missingMaterials)
              console.warn(`   Available materials:`, foundMaterials)
              console.warn(`   Please update jersey_mx.config.json - meshName should match material names`)
            }
          } else {
            // Fallback: use material names directly as partId
            allMeshes.forEach((mesh) => {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
              
              materials.forEach((material, index) => {
                if (material && material.name) {
                  const partId = material.name
                  partMap.set(partId, {
                    mesh: mesh,
                    material: material,
                    materialIndex: index,
                    materialName: material.name
                  })
                  partIds.push(partId)
                  console.log(`✅ Material détecté: "${partId}"`)
                }
              })
            })
          }
          
          console.log(`📦 Modèle chargé: ${partIds.length} zones mappées:`, partIds)
          console.log(`📋 PartMap entries:`, Array.from(partMap.keys()))

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

  /**
   * Load model configuration from JSON
   * @param {string} modelId - Model ID
   * @returns {Promise<Object|null>} Model configuration or null
   */
  async loadModelConfig(modelId) {
    try {
      const configPath = `/assets/models/${modelId}.config.json`
      console.log(`📋 Loading model config from: ${configPath}`)
      
      const response = await fetch(configPath)
      if (!response.ok) {
        throw new Error(`Config not found: ${response.status} ${response.statusText}`)
      }
      
      const config = await response.json()
      console.log('✅ Model config loaded:', {
        modelId: config.modelId,
        name: config.name,
        zonesCount: config.zones?.length || 0,
        designsCount: config.designs?.length || 0,
        designs: config.designs?.map(d => ({ id: d.id, name: d.name, baseTextures: Object.keys(d.baseTextures || {}) })) || [],
      })
      
      return config
    } catch (error) {
      console.error('❌ Failed to load model config:', error)
      return null
    }
  }

  /**
   * Get base texture URL for a design and part
   * @param {string} modelId - Model ID
   * @param {string} designId - Design ID
   * @param {string} partId - Part ID
   * @returns {Promise<string|null>} Texture URL or null
   */
  async getDesignBaseTexture(modelId, designId, partId) {
    const config = await this.loadModelConfig(modelId)
    if (!config || !config.designs) return null
    
    const design = config.designs.find(d => d.id === designId)
    if (!design || !design.baseTextures) return null
    
    return design.baseTextures[partId] || null
  }
}

