import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registerPwa } from './pwa.js'
import 'leaflet/dist/leaflet.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Registra o service worker com auto-update agressivo
registerPwa()
