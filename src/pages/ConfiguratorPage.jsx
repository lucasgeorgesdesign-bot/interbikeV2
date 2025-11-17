import { useEffect } from 'react'
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

  // Parse model query param and initialize
  useEffect(() => {
    const model = searchParams.get('model') || 'nebula'
    
    if (model !== modelId) {
      // Get default part IDs for this model
      const partIds = modelLoader.getDefaultPartIds(model)
      
      dispatch(setModel({ modelId: model, partIds }))
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
          modelId={modelId}
          parts={parts}
          sceneVersion={sceneVersion}
        />
      </div>
      <Sidebar />
    </div>
  )
}
