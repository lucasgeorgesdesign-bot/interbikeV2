import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPartNumber } from '../../store/configuratorSlice.js'
import AddNumberModal from '../Modals/AddNumberModal.jsx'
import ElementEditor from './ElementEditor.jsx'
import './Controls.css'

const POSITION_LABELS = {
  dos: 'Dos',
  face: 'Face',
  bra_d: 'Bras droit',
  bra_g: 'Bras gauche',
}

export default function NumbersTab({ sceneManagerRef }) {
  const dispatch = useDispatch()
  const parts = useSelector((state) => state.configurator.parts)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMode, setEditingMode] = useState(false)
  const [editingPartId, setEditingPartId] = useState(null)
  const [selectedElement, setSelectedElement] = useState(null)

  const handleAddNumber = (numberConfig) => {
    // Map position to partId
    const positionToPartId = {
      dos: 'back',
      face: 'front',
      bra_d: 'sleeve_right',
      bra_g: 'sleeve_left',
    }

    const partId = positionToPartId[numberConfig.positionKey]
    if (partId) {
      // Initialize with default position (center) if not provided
      const numberWithPosition = {
        ...numberConfig,
        xPercent: numberConfig.xPercent || 50,
        yPercent: numberConfig.yPercent || 50,
      }
      
      console.log('🎯 Adding number to partId:', partId, 'config:', numberWithPosition)
      dispatch(setPartNumber({ partId, number: numberWithPosition }))
      console.log('✅ Number dispatched, sceneVersion should increment')
      
      // Focus camera on the part and enable editing mode
      if (sceneManagerRef?.current) {
        sceneManagerRef.current.focusOnPart(partId)
        
        // Enable UV editing mode after a short delay (to allow camera animation)
        setTimeout(() => {
          setEditingMode(true)
          setEditingPartId(partId)
          
          sceneManagerRef.current.enableUVEditing(
            (clickedPartId, uvCoords) => {
              console.log('UV Editor callback called:', clickedPartId, uvCoords)
              // Only update if clicking on the same part
              if (clickedPartId === partId) {
                const currentNumber = parts[partId]?.number || numberWithPosition
                console.log('Updating number position:', uvCoords)
                dispatch(setPartNumber({
                  partId,
                  number: {
                    ...currentNumber,
                    xPercent: uvCoords.xPercent,
                    yPercent: uvCoords.yPercent,
                  }
                }))
              } else {
                console.log(`Clicked on ${clickedPartId}, but editing ${partId}`)
              }
            },
            null // onSelect callback (not used yet)
          )
        }, 1200) // Wait for camera animation to complete
      }
    }
    setModalOpen(false)
  }

  const handleRemoveNumber = (positionKey) => {
    const positionToPartId = {
      dos: 'back',
      face: 'front',
      bra_d: 'sleeve_right',
      bra_g: 'sleeve_left',
    }

    const partId = positionToPartId[positionKey]
    if (partId) {
      dispatch(setPartNumber({ partId, number: null }))
      
      // Disable editing mode if we're removing the currently edited number
      if (editingPartId === partId && sceneManagerRef?.current) {
        sceneManagerRef.current.disableUVEditing()
        setEditingMode(false)
        setEditingPartId(null)
      }
    }
  }

  const handleEditNumber = (positionKey) => {
    const positionToPartId = {
      dos: 'back',
      face: 'front',
      bra_d: 'sleeve_right',
      bra_g: 'sleeve_left',
    }

    const partId = positionToPartId[positionKey]
    if (partId && sceneManagerRef?.current) {
      // Focus camera on the part
      sceneManagerRef.current.focusOnPart(partId)
      
      // Enable UV editing mode
      setTimeout(() => {
        setEditingMode(true)
        setEditingPartId(partId)
        
        sceneManagerRef.current.enableUVEditing(
          (clickedPartId, uvCoords) => {
            if (clickedPartId === partId) {
              const currentNumber = parts[partId]?.number
              if (currentNumber) {
                dispatch(setPartNumber({
                  partId,
                  number: {
                    ...currentNumber,
                    xPercent: uvCoords.xPercent,
                    yPercent: uvCoords.yPercent,
                  }
                }))
              }
            }
          },
          null
        )
      }, 1200)
    }
  }

  const handleStopEditing = () => {
    if (sceneManagerRef?.current) {
      sceneManagerRef.current.disableUVEditing()
    }
    setEditingMode(false)
    setEditingPartId(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sceneManagerRef?.current) {
        sceneManagerRef.current.disableUVEditing()
      }
    }
  }, [])

  // Get existing numbers
  const existingNumbers = {}
  Object.entries(parts).forEach(([partId, partCfg]) => {
    if (partCfg.number) {
      const partIdToPosition = {
        back: 'dos',
        front: 'face',
        sleeve_right: 'bra_d',
        sleeve_left: 'bra_g',
      }
      const positionKey = partIdToPosition[partId]
      if (positionKey) {
        existingNumbers[positionKey] = partCfg.number
      }
    }
  })

  return (
    <div className="controls-tab">
      <h3>Numéros</h3>
      <p className="tab-description">Ajoutez des numéros aux positions standard</p>
      
      <button
        className="primary-button"
        onClick={() => setModalOpen(true)}
      >
        + Ajouter un numéro
      </button>

      {editingMode && (
        <div className="editing-hint" style={{
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <strong>Mode édition activé</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
            Cliquez sur le modèle 3D pour placer le numéro. Cliquez sur "Arrêter l'édition" pour terminer.
          </p>
          <button
            className="secondary-button"
            onClick={handleStopEditing}
            style={{ marginTop: '8px' }}
          >
            Arrêter l'édition
          </button>
        </div>
      )}

      {Object.keys(existingNumbers).length > 0 && (
        <div className="numbers-list">
          <h4>Numéros ajoutés</h4>
          {Object.entries(existingNumbers).map(([positionKey, numberCfg]) => {
            const positionToPartId = {
              dos: 'back',
              face: 'front',
              bra_d: 'sleeve_right',
              bra_g: 'sleeve_left',
            }
            const partId = positionToPartId[positionKey]
            const isEditing = editingPartId === partId

            return (
              <div key={positionKey} className="number-item" style={{
                border: isEditing ? '2px solid #2196f3' : '1px solid #ddd',
                backgroundColor: isEditing ? '#e3f2fd' : 'transparent'
              }}>
                <div className="number-info">
                  <span className="number-position">{POSITION_LABELS[positionKey]}</span>
                  <span className="number-value">{numberCfg.value}</span>
                  {numberCfg.xPercent && numberCfg.yPercent && (
                    <span className="number-position" style={{ fontSize: '11px', color: '#666' }}>
                      Position: {Math.round(numberCfg.xPercent)}%, {Math.round(numberCfg.yPercent)}%
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isEditing && (
                    <>
                      <button
                        className="secondary-button"
                        onClick={() => {
                          const currentNumber = parts[partId]?.number
                          if (currentNumber) {
                            setSelectedElement({
                              type: 'number',
                              partId: partId,
                              ...currentNumber,
                            })
                          }
                        }}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => handleEditNumber(positionKey)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        📍 Modifier position
                      </button>
                    </>
                  )}
                  <button
                    className="remove-button-small"
                    onClick={() => handleRemoveNumber(positionKey)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <AddNumberModal
          onSave={handleAddNumber}
          onClose={() => setModalOpen(false)}
        />
      )}

      {selectedElement && (
        <ElementEditor
          selectedElement={selectedElement}
          onClose={() => setSelectedElement(null)}
          sceneManagerRef={sceneManagerRef}
        />
      )}
    </div>
  )
}
