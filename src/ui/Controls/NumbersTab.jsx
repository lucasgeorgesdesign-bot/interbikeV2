import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPartNumber } from '../../store/configuratorSlice.js'
import AddNumberModal from '../Modals/AddNumberModal.jsx'
import './Controls.css'

const POSITION_LABELS = {
  dos: 'Dos',
  face: 'Face',
  bra_d: 'Bras droit',
  bra_g: 'Bras gauche',
}

export default function NumbersTab() {
  const dispatch = useDispatch()
  const parts = useSelector((state) => state.configurator.parts)
  const [modalOpen, setModalOpen] = useState(false)

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
      dispatch(setPartNumber({ partId, number: numberConfig }))
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
    }
  }

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

      {Object.keys(existingNumbers).length > 0 && (
        <div className="numbers-list">
          <h4>Numéros ajoutés</h4>
          {Object.entries(existingNumbers).map(([positionKey, numberCfg]) => (
            <div key={positionKey} className="number-item">
              <div className="number-info">
                <span className="number-position">{POSITION_LABELS[positionKey]}</span>
                <span className="number-value">{numberCfg.value}</span>
              </div>
              <button
                className="remove-button-small"
                onClick={() => handleRemoveNumber(positionKey)}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddNumberModal
          onSave={handleAddNumber}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
