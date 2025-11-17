import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ModelLoader } from './ModelLoader.js'
import { applyConfigToScene, disposeScene } from './applyConfigToScene.js'
import { textureCache } from './TextureCache.js'
import { UVInteractiveEditor } from './UVInteractiveEditor.js'

const modelLoader = new ModelLoader()

/**
 * SceneManager - Manages Three.js scene, camera, renderer, and lighting
 * Handles model loading and texture application
 */
const SceneManager = forwardRef(function SceneManager({ modelId, parts, sceneVersion }, ref) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const partMapRef = useRef(new Map())
  const animationFrameRef = useRef(null)
  const isRenderingRef = useRef(false)
  const controlsRef = useRef(null)
  const uvEditorRef = useRef(null)

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    // Position camera to view the model
    camera.position.set(0, 1.2, 3.5)
    camera.lookAt(0, 1, 0) // Look at center of model (slightly above ground)
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    })
    
    // Limit pixel ratio for performance
    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add OrbitControls for 360° rotation
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = true
    controls.minDistance = 2
    controls.maxDistance = 10
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI
    controls.target.set(0, 1, 0) // Center on model (slightly above ground)
    controls.rotateSpeed = 0.8 // Rotation speed
    controls.zoomSpeed = 1.0 // Zoom speed
    controls.update()
    controlsRef.current = controls

    // Initialize UV Interactive Editor
    const uvEditor = new UVInteractiveEditor(scene, camera, renderer, partMapRef.current)
    uvEditor.setControls(controls)
    uvEditorRef.current = uvEditor

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Add hemisphere light for better illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
    hemisphereLight.position.set(0, 10, 0)
    scene.add(hemisphereLight)

    // Animation loop
    const animate = () => {
      if (isRenderingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate)
        
        // Update controls (required for damping)
        if (controlsRef.current) {
          controlsRef.current.update()
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      }
    }

    isRenderingRef.current = true
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      isRenderingRef.current = false
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      
      if (sceneRef.current) {
        disposeScene(sceneRef.current)
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  // Load model when modelId changes
  useEffect(() => {
    if (!modelId || !sceneRef.current) return

    const loadModel = async () => {
      try {
        const modelPath = `/assets/models/${modelId}.glb`
        const { scene: modelScene, partMap, partIds } = await modelLoader.loadModel(modelPath, modelId)

        // Remove old model if exists
        if (sceneRef.current) {
          const oldModel = sceneRef.current.getObjectByName('model')
          if (oldModel) {
            disposeScene(oldModel)
            sceneRef.current.remove(oldModel)
          }
        }

        // Add new model
        modelScene.name = 'model'
        sceneRef.current.add(modelScene)
        partMapRef.current = partMap

        // Update UV editor with new partMap
        if (uvEditorRef.current) {
          uvEditorRef.current.partMap = partMap
          console.log('✅ Updated UV Editor partMap with', partMap.size, 'entries')
          // Log material references for debugging
          partMap.forEach((ref, partId) => {
            if (ref.mesh && ref.material) {
              console.log(`  - ${partId}: material = "${ref.materialName}" on mesh "${ref.mesh.name}"`)
            } else if (ref.name) {
              // Legacy: direct mesh
              console.log(`  - ${partId}: mesh name = "${ref.name}"`)
            }
          })
        }

        // Apply base textures from design immediately after model loads
        // This ensures textures are applied even if sceneVersion is 0
        // Use empty parts object to trigger base texture loading from config
        setTimeout(async () => {
          try {
            await applyConfigToScene(
              sceneRef.current,
              partMapRef.current,
              {}, // Empty parts - will use base textures from design config
              modelId,
              (completed, total) => {
                // Progress callback
              }
            )
          } catch (error) {
            console.error('Error applying initial textures:', error)
          }
        }, 100)

        // Initialize parts in Redux if needed (handled by ConfiguratorPage)
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }

    loadModel()
  }, [modelId])

  // Apply config when parts or sceneVersion changes
  useEffect(() => {
    if (!sceneRef.current || !modelId || partMapRef.current.size === 0) return

    const applyConfig = async () => {
      try {
        await applyConfigToScene(
          sceneRef.current,
          partMapRef.current,
          parts,
          modelId,
          (completed, total) => {
            // Progress callback (can be used for loading indicator)
          }
        )
      } catch (error) {
        console.error('Error applying config:', error)
      }
    }

    applyConfig()
  }, [modelId, parts, sceneVersion])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    enableUVEditing: (onPlace, onSelect) => {
      if (uvEditorRef.current) {
        uvEditorRef.current.enable(onPlace, onSelect)
      }
    },
    disableUVEditing: () => {
      if (uvEditorRef.current) {
        uvEditorRef.current.disable()
      }
    },
    focusOnPart: (partId) => {
      if (uvEditorRef.current) {
        uvEditorRef.current.focusOnPart(partId)
      }
    },
  }))

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
})

export default SceneManager

