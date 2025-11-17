import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary.jsx'
import ConfiguratorPage from './pages/ConfiguratorPage.jsx'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/configurator" element={<ConfiguratorPage />} />
          <Route path="/" element={<ConfiguratorPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
