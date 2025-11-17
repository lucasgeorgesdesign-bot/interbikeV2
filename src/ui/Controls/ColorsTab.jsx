import { useDispatch, useSelector } from 'react-redux'
import { setPartColor } from '../../store/configuratorSlice.js'
import './Controls.css'

// Zone mapping - can be customized per model
const ZONE_MAPPING = {
  front: { label: 'Torse', defaultColor: '#ffffff' },
  back: { label: 'Dos', defaultColor: '#ffffff' },
  sleeve_left: { label: 'Bras gauche', defaultColor: '#ffffff' },
  sleeve_right: { label: 'Bras droit', defaultColor: '#ffffff' },
  collar: { label: 'Col', defaultColor: '#ffffff' },
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080',
]

export default function ColorsTab() {
  const dispatch = useDispatch()
  const parts = useSelector((state) => state.configurator.parts)
  const modelId = useSelector((state) => state.configurator.modelId)

  // Get available zones for current model (can be customized per model)
  const availableZones = Object.keys(ZONE_MAPPING)

  const handleColorChange = (partId, color) => {
    dispatch(setPartColor({ partId, color }))
  }

  return (
    <div className="controls-tab">
      <h3>Couleur par zone</h3>
      <p className="tab-description">Sélectionnez une couleur pour chaque zone du maillot</p>
      
      {availableZones.map((zoneId) => {
        const zone = ZONE_MAPPING[zoneId]
        const currentColor = parts[zoneId]?.color || zone.defaultColor
        
        return (
          <div key={zoneId} className="control-group">
            <label>{zone.label}</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(zoneId, e.target.value)}
                className="color-input"
                title={currentColor}
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    handleColorChange(zoneId, e.target.value)
                  }
                }}
                className="color-text-input"
                placeholder="#ffffff"
                maxLength={7}
              />
              <div className="preset-colors">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`preset-color-button ${currentColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(zoneId, color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
