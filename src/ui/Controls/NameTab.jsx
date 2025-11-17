import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPartText } from '../../store/configuratorSlice.js'
import './Controls.css'

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
]

const POSITION_OPTIONS = [
  { partId: 'back', label: 'Dos', xPercent: 50, yPercent: 20 },
  { partId: 'front', label: 'Poitrine', xPercent: 50, yPercent: 30 },
]

export default function NameTab({ sceneManagerRef }) {
  const dispatch = useDispatch()
  const parts = useSelector((state) => state.configurator.parts)

  const [text, setText] = useState('')
  const [selectedPartId, setSelectedPartId] = useState('back')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState('#000000')
  const [strokeEnabled, setStrokeEnabled] = useState(false)
  const [strokeColor, setStrokeColor] = useState('#ffffff')
  const [strokeWidth, setStrokeWidth] = useState(2)

  const handleSave = () => {
    if (!text.trim()) {
      alert('Veuillez entrer un texte')
      return
    }

    const position = POSITION_OPTIONS.find((p) => p.partId === selectedPartId)
    
    const textConfig = {
      value: text.trim(),
      fontFamily,
      fontSize,
      color,
      stroke: strokeEnabled ? {
        color: strokeColor,
        width: strokeWidth,
      } : null,
      xPercent: position?.xPercent || 50,
      yPercent: position?.yPercent || 50,
    }
    
    console.log('Adding text to', selectedPartId, ':', textConfig)
    
    dispatch(setPartText({
      partId: selectedPartId,
      text: textConfig,
    }))

    // Reset form
    setText('')
    console.log('Text added, sceneVersion should increment')
  }

  const handleRemove = () => {
    dispatch(setPartText({ partId: selectedPartId, text: null }))
    setText('')
    alert('Texte supprimé')
  }

  // Check if text exists for selected part
  const existingText = parts[selectedPartId]?.text

  return (
    <div className="controls-tab">
      <h3>Nom / Texte</h3>
      <p className="tab-description">Ajoutez un nom ou un texte personnalisé</p>

      <div className="control-group">
        <label>Position</label>
        <select
          value={selectedPartId}
          onChange={(e) => setSelectedPartId(e.target.value)}
          className="select-input"
        >
          {POSITION_OPTIONS.map((pos) => (
            <option key={pos.partId} value={pos.partId}>
              {pos.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Texte</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Entrez le texte"
          className="text-input"
          maxLength={50}
        />
      </div>

      <div className="control-group">
        <label>Police</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="select-input"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
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
        <label>
          <input
            type="checkbox"
            checked={strokeEnabled}
            onChange={(e) => setStrokeEnabled(e.target.checked)}
          />
          Contour
        </label>
        {strokeEnabled && (
          <div className="stroke-controls">
            <div className="control-group">
              <label>Couleur contour</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="color-input"
              />
            </div>
            <div className="control-group">
              <label>Épaisseur ({strokeWidth}px)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="range-input"
              />
            </div>
          </div>
        )}
      </div>

      <div className="button-group">
        <button className="primary-button" onClick={handleSave}>
          Ajouter le texte
        </button>
        {existingText && (
          <button className="secondary-button" onClick={handleRemove}>
            Supprimer
          </button>
        )}
      </div>

      {existingText && (
        <div className="existing-text-preview">
          <p>Texte actuel: <strong>{existingText.value}</strong></p>
        </div>
      )}
    </div>
  )
}

