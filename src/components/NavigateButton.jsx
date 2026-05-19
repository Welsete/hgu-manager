import { useState } from 'react'

/**
 * Botão "Como chegar". Expande mostrando 2 opções (Google Maps / Waze)
 * que abrem o deep link de navegação. Funciona em Android, iOS e web.
 */
export function NavigateButton({ location }) {
  const [showOptions, setShowOptions] = useState(false)

  if (!location?.lat || !location?.lng) return null

  function openMaps() {
    // URL universal — abre o app do Google Maps se instalado, senão o site
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowOptions(false)
  }

  function openWaze() {
    // Deep link do Waze. Funciona web e abre o app se instalado.
    const url = `https://waze.com/ul?ll=${location.lat}%2C${location.lng}&navigate=yes`
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowOptions(false)
  }

  if (showOptions) {
    return (
      <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 space-y-2">
        <div className="text-slate-300 text-sm text-center mb-1">Abrir navegação em:</div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={openMaps} className="btn-secondary">
            📍 Google Maps
          </button>
          <button type="button" onClick={openWaze} className="btn-secondary">
            🚗 Waze
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowOptions(false)}
          className="btn-ghost w-full text-sm"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowOptions(true)}
      className="btn-secondary"
    >
      🧭 Como chegar
    </button>
  )
}
