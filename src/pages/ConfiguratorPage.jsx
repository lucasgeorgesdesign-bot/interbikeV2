import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setModel } from '../store/configuratorSlice.js'
import SceneManager from '../three/SceneManager.jsx'
import Sidebar from '../ui/Sidebar.jsx'
import { ModelLoader } from '../three/ModelLoader.js'
import './ConfiguratorPage.css'

const modelLoader = new ModelLoader()

export default function ConfiguratorPage() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const configuratorState = useSelector((state) => state.configurator)
  const { modelId, parts = {}, sceneVersion = 0 } = configuratorState || {}
  const sceneManagerRef = useRef(null)

  // Parse model and design from URL
  useEffect(() => {
    const model = searchParams.get('model') || 'jersey_mx'
    const design = searchParams.get('design') || null
    
    if (model !== modelId) {
      // Get default part IDs for this model
      const partIds = modelLoader.getDefaultPartIds(model)
      
      dispatch(setModel({ modelId: model, partIds }))
    }
    
    // Log design selection (on implémentera setDesign plus tard)
    if (design) {
      console.log('Design sélectionné:', design)
    }
  }, [searchParams, modelId, dispatch])

  // Show loading state
  if (!modelId) {
    return (
      <div className="configurator-page loading" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>Chargement du modèle...</div>
      </div>
    )
  }

  return (
    <div className="configurator-page">
      <div className="configurator-canvas">
        <SceneManager
          ref={sceneManagerRef}
          modelId={modelId}
          parts={parts}
          sceneVersion={sceneVersion}
        />
      </div>
      <Sidebar sceneManagerRef={sceneManagerRef} />
    </div>
  )
}
