import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

/**
 * TextElementGizmo - Manages 3D gizmos for text/number elements
 * Creates proxy 3D objects that can be transformed, then converts to UV coordinates
 */
export class TextElementGizmo {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.elements = new Map() // Map<elementId, { plane, controls, partId, elementType }>
    this.selectedElementId = null
    this.onUpdateCallback = null
  }

  /**
   * Add or update a text/number element gizmo
   * @param {string} elementId - Unique element ID
   * @param {string} partId - Part ID (front, back, etc.)
   * @param {Object} config - Element config { value, xPercent, yPercent, fontSize, color, etc. }
   * @param {Object} materialRef - Material reference from partMap
   */
  addElement(elementId, partId, config, materialRef) {
    // Remove existing if present
    this.removeElement(elementId)

    const { mesh } = materialRef
    if (!mesh) return

    // Get bounding box of the mesh to position the plane
    const box = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // Create a plane to represent the text/number
    // Position it on the mesh surface based on UV coordinates
    const planeGeometry = new THREE.PlaneGeometry(size.x * 0.3, size.y * 0.3)
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: config.color || '#000000',
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    })

    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    
    // Calculate 3D position from UV coordinates
    // This is a simplified approach - in production, you'd raycast from UV to 3D
    const xPercent = config.xPercent || 50
    const yPercent = config.yPercent || 50
    
    // Position plane on mesh surface (approximation)
    plane.position.copy(center)
    plane.position.y += size.y * (0.5 - yPercent / 100)
    plane.position.z += size.z * (0.5 - xPercent / 100)
    
    // Make plane face camera initially
    plane.lookAt(this.camera.position)
    plane.rotateY(Math.PI) // Flip to face camera
    
    // Add text label (using CSS2DRenderer would be better, but for now use a simple approach)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = config.color || '#000000'
    ctx.font = `bold ${config.fontSize || 48}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.value || '', 128, 32)
    
    const texture = new THREE.CanvasTexture(canvas)
    planeMaterial.map = texture
    planeMaterial.needsUpdate = true

    this.scene.add(plane)

    // Create transform controls
    const controls = new TransformControls(this.camera, this.renderer.domElement)
    controls.attach(plane)
    controls.setMode('translate')
    controls.setSpace('local')
    
    // Handle transform changes
    controls.addEventListener('change', () => {
      if (this.onUpdateCallback) {
        // Convert 3D position back to UV coordinates
        // This is simplified - in production, you'd project back to UV space
        const relativePos = plane.position.clone().sub(center)
        const newXPercent = 50 + (relativePos.z / size.z) * 50
        const newYPercent = 50 - (relativePos.y / size.y) * 50
        
        this.onUpdateCallback(elementId, {
          xPercent: Math.max(0, Math.min(100, newXPercent)),
          yPercent: Math.max(0, Math.min(100, newYPercent)),
        })
      }
    })

    controls.addEventListener('dragging-changed', (event) => {
      // Disable orbit controls when dragging
      // This would need to be passed from SceneManager
    })

    this.elements.set(elementId, {
      plane,
      controls,
      partId,
      elementType: config.value ? 'number' : 'text',
      config,
    })

    // Auto-select if this is the first element
    if (this.elements.size === 1) {
      this.selectElement(elementId)
    }
  }

  /**
   * Remove an element gizmo
   */
  removeElement(elementId) {
    const element = this.elements.get(elementId)
    if (!element) return

    if (element.controls) {
      element.controls.dispose()
    }
    if (element.plane) {
      this.scene.remove(element.plane)
      if (element.plane.material.map) {
        element.plane.material.map.dispose()
      }
      element.plane.geometry.dispose()
      element.plane.material.dispose()
    }

    this.elements.delete(elementId)
    
    if (this.selectedElementId === elementId) {
      this.selectedElementId = null
    }
  }

  /**
   * Select an element (show gizmo)
   */
  selectElement(elementId) {
    // Deselect previous
    if (this.selectedElementId) {
      const prev = this.elements.get(this.selectedElementId)
      if (prev && prev.controls) {
        this.scene.remove(prev.controls)
      }
    }

    // Select new
    const element = this.elements.get(elementId)
    if (element && element.controls) {
      this.scene.add(element.controls)
      this.selectedElementId = elementId
    }
  }

  /**
   * Deselect all elements
   */
  deselectAll() {
    if (this.selectedElementId) {
      const element = this.elements.get(this.selectedElementId)
      if (element && element.controls) {
        this.scene.remove(element.controls)
      }
      this.selectedElementId = null
    }
  }

  /**
   * Set update callback
   */
  setOnUpdate(callback) {
    this.onUpdateCallback = callback
  }

  /**
   * Update all elements from Redux state
   */
  updateFromParts(parts, partMap) {
    // Clear all existing
    const existingIds = Array.from(this.elements.keys())
    existingIds.forEach(id => this.removeElement(id))

    // Add elements from Redux
    Object.entries(parts).forEach(([partId, partCfg]) => {
      const materialRef = partMap.get(partId)
      if (!materialRef) return

      // Add number if exists
      if (partCfg.number && partCfg.number.value) {
        const elementId = `number_${partId}`
        this.addElement(elementId, partId, {
          ...partCfg.number,
          value: partCfg.number.value,
        }, materialRef)
      }

      // Add text if exists
      if (partCfg.text && partCfg.text.value) {
        const elementId = `text_${partId}`
        this.addElement(elementId, partId, {
          ...partCfg.text,
          value: partCfg.text.value,
        }, materialRef)
      }
    })
  }

  /**
   * Dispose all resources
   */
  dispose() {
    const elementIds = Array.from(this.elements.keys())
    elementIds.forEach(id => this.removeElement(id))
    this.elements.clear()
    this.selectedElementId = null
  }
}

