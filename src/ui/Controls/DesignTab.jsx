import { useSelector } from 'react-redux'
import './Controls.css'

const PRESETS = [
  { id: 'nebula', name: 'Nebula', preview: '/assets/models/nebula_preview.jpg' },
  { id: 'classic', name: 'Classic', preview: '/assets/models/classic_preview.jpg' },
  { id: 'sport', name: 'Sport', preview: '/assets/models/sport_preview.jpg' },
]

export default function DesignTab() {
  const modelId = useSelector((state) => state.configurator.modelId)

  return (
    <div className="controls-tab">
      <h3>Design</h3>
      <div className="design-presets">
        {PRESETS.map((preset) => (
          <div
            key={preset.id}
            className={`preset-card ${modelId === preset.id ? 'active' : ''}`}
          >
            <div className="preset-preview">
              <img
                src={preset.preview}
                alt={preset.name}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="preset-placeholder">Preview</div>
            </div>
            <div className="preset-name">{preset.name}</div>
          </div>
        ))}
      </div>
      {modelId && (
        <div className="current-design">
          <p>Modèle actuel: <strong>{modelId}</strong></p>
        </div>
      )}
    </div>
  )
}

