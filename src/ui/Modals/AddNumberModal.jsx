import { useState } from 'react'
import './AddNumberModal.css'

const POSITIONS = [
  {
    key: 'dos',
    label: 'Dos',
    preview: '/assets/positions/dos_preview.jpg',
    description: 'Haut du dos',
  },
  {
    key: 'face',
    label: 'Face',
    preview: '/assets/positions/face_preview.jpg',
    description: 'Poitrine',
  },
  {
    key: 'bra_d',
    label: 'Bras droit',
    preview: '/assets/positions/bra_d_preview.jpg',
    description: 'Bras droit',
  },
  {
    key: 'bra_g',
    label: 'Bras gauche',
    preview: '/assets/positions/bra_g_preview.jpg',
    description: 'Bras gauche',
  },
]

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
]

export default function AddNumberModal({ onSave, onClose }) {
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [numberValue, setNumberValue] = useState('')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [size, setSize] = useState(72)
  const [color, setColor] = useState('#000000')

  const handleSave = () => {
    if (!selectedPosition) {
      alert('Veuillez sélectionner une position')
      return
    }

    if (!numberValue.trim()) {
      alert('Veuillez entrer un numéro')
      return
    }

    onSave({
      value: numberValue.trim(),
      fontFamily,
      size,
      color,
      positionKey: selectedPosition,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ajouter un numéro</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="positions-section">
            <h4>Sélectionnez une position</h4>
            <div className="positions-grid">
              {POSITIONS.map((position) => (
                <div
                  key={position.key}
                  className={`position-card ${selectedPosition === position.key ? 'active' : ''}`}
                  onClick={() => setSelectedPosition(position.key)}
                >
                  <div className="position-preview">
                    <img
                      src={position.preview}
                      alt={position.label}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<div class="position-placeholder">${position.label}</div>`
                      }}
                    />
                  </div>
                  <div className="position-label">{position.label}</div>
                  <div className="position-description">{position.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="number-config-section">
            <h4>Configuration du numéro</h4>

            <div className="control-group">
              <label>Numéro</label>
              <input
                type="text"
                value={numberValue}
                onChange={(e) => setNumberValue(e.target.value)}
                placeholder="Ex: 42"
                className="text-input"
                maxLength={10}
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
              <label>Taille ({size}px)</label>
              <input
                type="range"
                min="48"
                max="120"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
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
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" onClick={handleSave}>
            Ajouter le numéro
          </button>
        </div>
      </div>
    </div>
  )
}

