import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPartLogo, setPartImageUrl, setPartTextureUrl } from '../../store/configuratorSlice.js'
import { uploadFile } from '../../api/upload.js'
import { resizeImage } from '../../utils/imageResize.js'
import LogosBrowser from '../LogosBrowser.jsx'
import './Controls.css'

const ZONE_TABS = [
  { id: 'front', label: 'Torse' },
  { id: 'back', label: 'Dos' },
  { id: 'sleeve_right', label: 'Bras droit' },
  { id: 'sleeve_left', label: 'Bras gauche' },
]

export default function LogosTab() {
  const dispatch = useDispatch()
  const parts = useSelector((state) => state.configurator.parts)
  const [activeZone, setActiveZone] = useState('front')
  const [showBrowser, setShowBrowser] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (file) => {
    if (!file) return

    setUploading(true)

    try {
      // Resize if too large
      const resizedFile = file.size > 5 * 1024 * 1024
        ? await resizeImage(file, 2048, 2048)
        : file

      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(resizedFile)

      // Dispatch preview
      dispatch(setPartImageUrl({ partId: activeZone, imageUrl: previewUrl }))

      // Upload to server (async, non-blocking)
      try {
        const result = await uploadFile(resizedFile)
        if (result.url) {
          dispatch(setPartTextureUrl({ partId: activeZone, textureUrl: result.url }))
        }
      } catch (uploadError) {
        console.warn('Upload failed, using local preview:', uploadError)
        // Keep using preview URL
      }
    } catch (error) {
      console.error('Error processing logo:', error)
      alert('Erreur lors du traitement du logo')
    } finally {
      setUploading(false)
    }
  }

  const handleLogoSelect = (logoId, logoUrl) => {
    dispatch(setPartLogo({
      partId: activeZone,
      logoId,
      imageUrl: logoUrl,
    }))
    setShowBrowser(false)
  }

  const currentLogo = parts[activeZone]?.imageUrl || parts[activeZone]?.logoId

  return (
    <div className="controls-tab">
      <h3>Logos</h3>
      <p className="tab-description">Ajoutez un logo à chaque zone</p>

      <div className="zone-tabs">
        {ZONE_TABS.map((zone) => (
          <button
            key={zone.id}
            className={`zone-tab-button ${activeZone === zone.id ? 'active' : ''}`}
            onClick={() => setActiveZone(zone.id)}
          >
            {zone.label}
          </button>
        ))}
      </div>

      <div className="logo-controls">
        <div className="button-group">
          <button
            className="primary-button"
            onClick={() => setShowBrowser(true)}
            disabled={uploading}
          >
            📚 Catalogue
          </button>
          <label className="file-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="file-input"
              disabled={uploading}
            />
            {uploading ? 'Upload...' : '+ Uploader'}
          </label>
        </div>

        {currentLogo && (
          <div className="logo-preview-container">
            <img
              src={currentLogo.startsWith('/') ? currentLogo : currentLogo}
              alt="Logo preview"
              className="logo-preview-image"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <button
              className="remove-button-small"
              onClick={() => {
                dispatch(setPartLogo({ partId: activeZone, logoId: null, imageUrl: null }))
              }}
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {showBrowser && (
        <LogosBrowser
          onSelect={handleLogoSelect}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </div>
  )
}
