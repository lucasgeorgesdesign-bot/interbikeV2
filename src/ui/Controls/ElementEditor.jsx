import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPartText, setPartNumber } from '../../store/configuratorSlice.js'
import './Controls.css'

/**
 * ElementEditor - UI for editing selected text/number elements
 * Shows transformation controls and properties
 */
export default function ElementEditor({ selectedElement, onClose, sceneManagerRef }) {
  const dispatch = useDispatch()
  const parts = useSelector((state) => state.configurator.parts)
  
  const [fontSize, setFontSize] = useState(selectedElement?.fontSize || 48)
  const [color, setColor] = useState(selectedElement?.color || '#000000')
  const [xPercent, setXPercent] = useState(selectedElement?.xPercent || 50)
  const [yPercent, setYPercent] = useState(selectedElement?.yPercent || 50)

  useEffect(() => {
    if (selectedElement) {
      setFontSize(selectedElement.fontSize || 48)
      setColor(selectedElement.color || '#000000')
      setXPercent(selectedElement.xPercent || 50)
      setYPercent(selectedElement.yPercent || 50)
    }
  }, [selectedElement])

  if (!selectedElement) return null

  const handleUpdate = () => {
    // Preserve all existing properties and only update changed ones
    const update = {
      ...selectedElement, // Preserve all original properties (value, fontFamily, stroke, etc.)
      fontSize: fontSize || selectedElement.fontSize,
      color: color || selectedElement.color,
      xPercent: parseFloat(xPercent) || selectedElement.xPercent || 50,
      yPercent: parseFloat(yPercent) || selectedElement.yPercent || 50,
    }

    console.log('✏️ Updating element:', {
      type: selectedElement.type,
      partId: selectedElement.partId,
      update,
    })

    if (selectedElement.type === 'text') {
      dispatch(setPartText({
        partId: selectedElement.partId,
        text: update,
      }))
      console.log('✅ Text updated in Redux')
    } else if (selectedElement.type === 'number') {
      dispatch(setPartNumber({
        partId: selectedElement.partId,
        number: update,
      }))
      console.log('✅ Number updated in Redux')
    }
  }

  const handleDelete = () => {
    if (selectedElement.type === 'text') {
      dispatch(setPartText({
        partId: selectedElement.partId,
        text: null,
      }))
    } else if (selectedElement.type === 'number') {
      dispatch(setPartNumber({
        partId: selectedElement.partId,
        number: null,
      }))
    }
    onClose()
  }

  return (
    <div className="element-editor" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '300px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Éditer {selectedElement.type === 'text' ? 'Texte' : 'Numéro'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
      </div>

      <div className="control-group">
        <label>Valeur</label>
        <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          {selectedElement.value}
        </div>
      </div>

      <div className="control-group">
        <label>Taille ({fontSize}px)</label>
        <input
          type="range"
          min="24"
          max="120"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="range-input"
        />
      </div>

      <div className="control-group">
        <label>Couleur</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-input"
        />
      </div>

      <div className="control-group">
        <label>Position X ({xPercent}%)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={xPercent}
          onChange={(e) => setXPercent(Number(e.target.value))}
          className="range-input"
        />
      </div>

      <div className="control-group">
        <label>Position Y ({yPercent}%)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={yPercent}
          onChange={(e) => setYPercent(Number(e.target.value))}
          className="range-input"
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button className="primary-button" onClick={handleUpdate}>
          Appliquer
        </button>
        <button className="secondary-button" onClick={() => {
          if (sceneManagerRef?.current) {
            sceneManagerRef.current.enableUVEditing(
              (clickedPartId, uvCoords) => {
                if (clickedPartId === selectedElement.partId) {
                  setXPercent(uvCoords.xPercent)
                  setYPercent(uvCoords.yPercent)
                  handleUpdate()
                }
              },
              null
            )
          }
        }}>
          📍 Placer sur modèle
        </button>
        <button className="remove-button-small" onClick={handleDelete}>
          Supprimer
        </button>
      </div>
    </div>
  )
}

