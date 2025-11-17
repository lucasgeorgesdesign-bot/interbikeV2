import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ModelLoader } from './ModelLoader.js'
import { applyConfigToScene, disposeScene } from './applyConfigToScene.js'
import { textureCache } from './TextureCache.js'

const modelLoader = new ModelLoader()

/**
 * SceneManager - Manages Three.js scene, camera, renderer, and lighting
 * Handles model loading and texture application
 */
export default function SceneManager({ modelId, parts, sceneVersion }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const partMapRef = useRef(new Map())
  const animationFrameRef = useRef(null)
  const isRenderingRef = useRef(false)

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
    camera.position.set(0, 1.5, 3)
    camera.lookAt(0, 0, 0)
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
        const { scene: modelScene, partMap, partIds } = await modelLoader.loadModel(modelPath)

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

        // Initialize parts in Redux if needed (handled by ConfiguratorPage)
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }

    loadModel()
  }, [modelId])

  // Apply config when parts or sceneVersion changes
  useEffect(() => {
    if (!sceneRef.current || !modelId || sceneVersion === 0) return

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

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

