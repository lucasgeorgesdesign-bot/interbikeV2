/**
 * applyTexture - Applies a texture blob to a Three.js mesh
 */
import * as THREE from 'three'

/**
 * Applies a texture blob to a mesh
 * @param {Blob} blob - Texture blob
 * @param {THREE.Mesh} mesh - Three.js mesh to apply texture to
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 */
export async function applyTextureBlobToMesh(blob, mesh, renderer) {
  const loader = new THREE.TextureLoader()

  // Dispose old texture if exists
  if (mesh.material && mesh.material.map) {
    mesh.material.map.dispose()
  }

  // Create object URL from blob
  const objectUrl = URL.createObjectURL(blob)

  try {
    // Load texture from blob URL
    const texture = await new Promise((resolve, reject) => {
      loader.load(
        objectUrl,
        (texture) => {
          texture.needsUpdate = true
          resolve(texture)
        },
        undefined,
        (error) => reject(error)
      )
    })

    // Create or update material
    if (!mesh.material) {
      mesh.material = new THREE.MeshStandardMaterial()
    }
    mesh.material.map = texture
    mesh.material.needsUpdate = true
  } catch (error) {
    console.error('Error applying texture:', error)
  } finally {
    // Clean up object URL after a delay to allow texture loading
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
    }, 2000)
  }
}

