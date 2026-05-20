import { useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 } // São Paulo

// Pino vermelho estilo "alfinete"
const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width: 30px; height: 30px;
    background: #ef4444;
    border: 4px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 3px 8px rgba(0,0,0,0.6);
  "></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
})

/**
 * Marker arrastável + clique no mapa pra mover.
 */
function DraggableMarker({ position, onChange }) {
  const ref = useRef(null)

  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })

  return (
    <Marker
      draggable
      position={[position.lat, position.lng]}
      icon={PIN_ICON}
      ref={ref}
      eventHandlers={{
        dragend() {
          const m = ref.current
          if (m) {
            const ll = m.getLatLng()
            onChange({ lat: ll.lat, lng: ll.lng })
          }
        }
      }}
    />
  )
}

/**
 * Modal pra escolher o local arrastando um alfinete no mapa.
 * Recebe initialLocation (atual) e userPosition (fallback) e devolve { lat, lng } no confirmar.
 */
export function LocationPickerModal({ open, initialLocation, userPosition, onConfirm, onCancel }) {
  const start = initialLocation || userPosition || DEFAULT_CENTER
  const [pos, setPos] = useState(start)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={onCancel} className="btn-ghost" type="button">
            &larr; Cancelar
          </button>
          <h2 className="flex-1 text-center text-lg font-semibold pr-20">
            Escolher local
          </h2>
        </div>
      </header>

      <div className="flex-1 relative">
        <MapContainer
          center={[start.lat, start.lng]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <DraggableMarker position={pos} onChange={setPos} />
        </MapContainer>

        <div className="absolute top-3 inset-x-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 text-center shadow-lg">
          Arraste o alfinete ou toque no mapa para marcar o local exato
        </div>
      </div>

      <footer className="bg-slate-900 border-t border-slate-800 shrink-0">
        <div className="max-w-xl mx-auto px-4 py-3 space-y-2">
          <div className="text-slate-400 text-xs text-center">
            Lat: {pos.lat.toFixed(6)} · Lng: {pos.lng.toFixed(6)}
          </div>
          <button
            type="button"
            onClick={() => onConfirm(pos)}
            className="btn-primary"
          >
            Confirmar local
          </button>
        </div>
      </footer>
    </div>
  )
}
