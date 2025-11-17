import * as THREE from 'three'

/**
 * UVInteractiveEditor - Handles interactive UV placement on 3D model
 * Converts 3D world coordinates to UV coordinates for texture placement
 */
export class UVInteractiveEditor {
  constructor(scene, camera, renderer, partMap) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.partMap = partMap
    this.raycaster = new THREE.Raycaster()
    this.isEnabled = false
    this.onPlaceCallback = null
    this.onSelectCallback = null
    this.selectedElement = null
  }

  /**
   * Enable interactive mode
   * @param {Function} onPlace - Callback when user places element (partId, uvCoords)
   * @param {Function} onSelect - Callback when user selects element (partId, uvCoords)
   */
  enable(onPlace, onSelect) {
    this.isEnabled = true
    this.onPlaceCallback = onPlace
    this.onSelectCallback = onSelect
    
    this.renderer.domElement.style.cursor = 'crosshair'
    this.renderer.domElement.addEventListener('click', this.handleClick)
  }

  /**
   * Disable interactive mode
   */
  disable() {
    this.isEnabled = false
    this.onPlaceCallback = null
    this.onSelectCallback = null
    this.selectedElement = null
    
    this.renderer.domElement.style.cursor = 'default'
    this.renderer.domElement.removeEventListener('click', this.handleClick)
  }

  /**
   * Handle click on canvas
   */
  handleClick = (event) => {
    if (!this.isEnabled) {
      console.log('UV Editor is not enabled')
      return
    }

    if (!this.renderer || !this.renderer.domElement) {
      console.warn('Renderer not available')
      return
    }

    const rect = this.renderer.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(mouse, this.camera)

    // Get all meshes from partMap (materialRef.mesh)
    const meshes = Array.from(this.partMap.values())
      .map(ref => ref.mesh || ref) // Support both materialRef and direct mesh
      .filter(Boolean)
    
    console.log(`🔍 Raycasting on ${meshes.length} meshes`)
    
    if (meshes.length === 0) {
      console.warn('No meshes in partMap')
      return
    }

    const intersects = this.raycaster.intersectObjects(meshes, true)
    console.log(`🎯 Found ${intersects.length} intersections`)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      const clickedMesh = intersection.object

      // Find which material was clicked
      let partId = null
      let clickedMaterial = null
      
      // Check if partMap contains materialRef objects or direct meshes
      const firstRef = Array.from(this.partMap.values())[0]
      const isMaterialRef = firstRef && firstRef.mesh && firstRef.material
      
      if (isMaterialRef) {
        // Material-based mapping: find which material was clicked
        const faceMaterialIndex = intersection.face?.materialIndex ?? 0
        const materials = Array.isArray(clickedMesh.material) 
          ? clickedMesh.material 
          : [clickedMesh.material]
        clickedMaterial = materials[faceMaterialIndex]
        
        // Find the partId that corresponds to this mesh + material combination
        this.partMap.forEach((ref, pid) => {
          if (ref.mesh === clickedMesh && ref.material === clickedMaterial) {
            partId = pid
          }
        })
        
        if (!partId && clickedMaterial && clickedMaterial.name) {
          // Fallback: try to find by material name
          this.partMap.forEach((ref, pid) => {
            if (ref.materialName === clickedMaterial.name) {
              partId = pid
            }
          })
        }
      } else {
        // Direct mesh mapping (legacy support)
        partId = clickedMesh.name
      }

      if (!partId) {
        console.warn('Cannot determine partId from clicked material', {
          meshName: clickedMesh.name,
          materialName: clickedMaterial?.name,
          materialIndex: intersection.face?.materialIndex
        })
        return
      }

      // Get UV coordinates
      const uv = intersection.uv
      if (!uv) {
        console.warn('No UV coordinates found in intersection')
        return
      }

      // Log raw UV values for debugging
      console.log('🔍 Raw UV coordinates:', {
        uvX: uv.x,
        uvY: uv.y,
        uvXType: typeof uv.x,
        uvYType: typeof uv.y,
      })

      // Clamp UV coordinates to [0, 1] range (some models have UVs outside this range)
      // Then convert to percentage (0-100)
      const clampedUvX = Math.max(0, Math.min(1, uv.x))
      const clampedUvY = Math.max(0, Math.min(1, uv.y))
      
      const uvCoords = {
        xPercent: clampedUvX * 100,
        yPercent: (1 - clampedUvY) * 100, // Flip Y (Three.js UVs are bottom-up)
      }

      // Warn if UVs were out of range
      if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
        console.warn('⚠️ UV coordinates out of [0,1] range, clamped:', {
          original: { x: uv.x, y: uv.y },
          clamped: { x: clampedUvX, y: clampedUvY },
          final: uvCoords,
        })
      }

      console.log(`📍 Clicked on ${partId} at UV:`, uvCoords)

      // Call callback
      if (this.onPlaceCallback) {
        this.onPlaceCallback(partId, uvCoords)
      } else {
        console.warn('No onPlaceCallback set')
      }
    } else {
      console.log('No intersection found')
    }
  }

  /**
   * Focus camera on a specific part
   * @param {string} partId - Part ID to focus on
   */
  focusOnPart(partId) {
    const materialRef = this.partMap.get(partId)
    if (!materialRef) {
      console.warn(`Material reference not found for partId: ${partId}`)
      return
    }

    const mesh = materialRef.mesh || materialRef
    if (!mesh) {
      console.warn(`Mesh not found for partId: ${partId}`)
      return
    }

    // Get bounding box of the mesh
    const box = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 2.5

    // Calculate camera position based on part
    // For "back", position camera behind the model
    // For "front", position camera in front
    let cameraPosition
    if (partId === 'back') {
      cameraPosition = new THREE.Vector3(0, center.y, -distance)
    } else if (partId === 'front') {
      cameraPosition = new THREE.Vector3(0, center.y, distance)
    } else if (partId === 'sleeve_left') {
      cameraPosition = new THREE.Vector3(-distance, center.y, 0)
    } else if (partId === 'sleeve_right') {
      cameraPosition = new THREE.Vector3(distance, center.y, 0)
    } else {
      // Default: position camera to view the mesh
      cameraPosition = new THREE.Vector3(0, center.y, distance)
    }

    // Animate camera to new position
    this.animateCameraTo(cameraPosition, center)
  }

  /**
   * Animate camera to target position
   * @param {THREE.Vector3} targetPosition - Target camera position
   * @param {THREE.Vector3} lookAt - Point to look at
   */
  animateCameraTo(targetPosition, lookAt) {
    const startPosition = this.camera.position.clone()
    const startTarget = this.controls?.target?.clone() || new THREE.Vector3(0, 1, 0)
    const duration = 1000 // 1 second
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease in out)
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      // Interpolate position
      this.camera.position.lerpVectors(startPosition, targetPosition, ease)
      
      // Interpolate target
      if (this.controls) {
        const newTarget = new THREE.Vector3()
        newTarget.lerpVectors(startTarget, lookAt, ease)
        this.controls.target.copy(newTarget)
        this.controls.update()
      } else {
        const interpolatedTarget = new THREE.Vector3()
        interpolatedTarget.lerpVectors(startTarget, lookAt, ease)
        this.camera.lookAt(interpolatedTarget)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  /**
   * Set OrbitControls reference for camera animation
   * @param {OrbitControls} controls - OrbitControls instance
   */
  setControls(controls) {
    this.controls = controls
  }
}

