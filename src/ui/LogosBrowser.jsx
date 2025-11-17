import { useState } from 'react'
import './LogosBrowser.css'

// Mock logos catalog - in production, fetch from server
const LOGOS_CATALOG = [
  {
    id: 'logo1',
    name: 'Logo Sponsor 1',
    svgUrl: '/assets/logos_catalog/logo1.svg',
    previewPng: '/assets/logos_catalog/logo1.png',
    license: 'Commercial',
  },
  {
    id: 'logo2',
    name: 'Logo Sponsor 2',
    svgUrl: '/assets/logos_catalog/logo2.svg',
    previewPng: '/assets/logos_catalog/logo2.png',
    license: 'Commercial',
  },
  {
    id: 'logo3',
    name: 'Logo Sponsor 3',
    svgUrl: '/assets/logos_catalog/logo3.svg',
    previewPng: '/assets/logos_catalog/logo3.png',
    license: 'Commercial',
  },
]

export default function LogosBrowser({ onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogos = LOGOS_CATALOG.filter((logo) =>
    logo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (logo) => {
    onSelect(logo.id, logo.svgUrl || logo.previewPng)
  }

  return (
    <div className="logos-browser-overlay" onClick={onClose}>
      <div className="logos-browser" onClick={(e) => e.stopPropagation()}>
        <div className="logos-browser-header">
          <h3>Catalogue de logos</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="logos-browser-search">
          <input
            type="text"
            placeholder="Rechercher un logo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="logos-grid">
          {filteredLogos.length === 0 ? (
            <div className="no-results">Aucun logo trouvé</div>
          ) : (
            filteredLogos.map((logo) => (
              <div
                key={logo.id}
                className="logo-card"
                onClick={() => handleSelect(logo)}
              >
                <div className="logo-preview">
                  <img
                    src={logo.previewPng || logo.svgUrl}
                    alt={logo.name}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<div class="logo-placeholder">Logo</div>'
                    }}
                  />
                </div>
                <div className="logo-name">{logo.name}</div>
                {logo.license && (
                  <div className="logo-license">{logo.license}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

