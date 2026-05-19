import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import { getAvailability, statusColor, statusLabel } from '../utils/availability.js'

// Centro padrão: São Paulo. Só usado quando não há nem GPS nem HGUs.
const DEFAULT_CENTER = [-23.5505, -46.6333]
const DEFAULT_ZOOM = 13

/**
 * Componente auxiliar que ajusta zoom/centro do mapa quando os pontos mudam.
 * Foi feito assim porque o Leaflet só expõe a instância do mapa via hook useMap().
 */
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 16)
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 16 })
    }
  }, [map, points])
  return null
}

/**
 * Cria um ícone de pino circular colorido (usando divIcon do Leaflet).
 * Evita o bug dos ícones default do Leaflet que não carregam em bundlers.
 */
function makePinIcon(color) {
  return L.divIcon({
    className: 'hgu-pin',
    html: `<div style="
      width: 26px; height: 26px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  })
}

export function MapView({ hgus, userPosition, onSelectHgu }) {
  // Só pinos para HGUs com coordenadas válidas
  const positioned = useMemo(
    () => hgus.filter((h) => h.location?.lat != null && h.location?.lng != null),
    [hgus]
  )

  // Bounds = usuário + todos os HGUs com GPS
  const bounds = useMemo(() => {
    const pts = []
    if (userPosition) pts.push([userPosition.lat, userPosition.lng])
    positioned.forEach((h) => pts.push([h.location.lat, h.location.lng]))
    return pts
  }, [userPosition, positioned])

  const initialCenter = userPosition
    ? [userPosition.lat, userPosition.lng]
    : positioned[0]
    ? [positioned[0].location.lat, positioned[0].location.lng]
    : DEFAULT_CENTER

  return (
    <MapContainer
      center={initialCenter}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <FitBounds points={bounds} />

      {userPosition && (
        <CircleMarker
          center={[userPosition.lat, userPosition.lng]}
          radius={9}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.5,
            weight: 3
          }}
        >
          <Popup>Você está aqui</Popup>
        </CircleMarker>
      )}

      {positioned.map((hgu) => {
        const { status } = getAvailability(hgu)
        const color = statusColor(status)
        return (
          <Marker
            key={hgu.id}
            position={[hgu.location.lat, hgu.location.lng]}
            icon={makePinIcon(color)}
          >
            <Popup>
              <div style={{ minWidth: 180, fontFamily: 'inherit' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                  {hgu.ssid}
                </div>
                <div style={{ color, fontSize: 12, marginBottom: 8 }}>
                  ● {statusLabel(status)}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectHgu?.(hgu)}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Ver detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
