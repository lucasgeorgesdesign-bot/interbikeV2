import { useState } from 'react'
import DesignTab from './Controls/DesignTab.jsx'
import ColorsTab from './Controls/ColorsTab.jsx'
import NumbersTab from './Controls/NumbersTab.jsx'
import NameTab from './Controls/NameTab.jsx'
import LogosTab from './Controls/LogosTab.jsx'
import './Sidebar.css'

const TABS = [
  { id: 'design', label: 'Design', component: DesignTab },
  { id: 'colors', label: 'Couleur', component: ColorsTab },
  { id: 'numbers', label: 'Numéro', component: NumbersTab },
  { id: 'name', label: 'Nom', component: NameTab },
  { id: 'logos', label: 'Logo', component: LogosTab },
]

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('design')

  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component || DesignTab

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Configuration</h2>
      </div>
      <div className="sidebar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sidebar-content">
        <ActiveComponent />
      </div>
    </div>
  )
}
