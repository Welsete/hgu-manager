import { useEffect, useMemo, useRef } from 'react'
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
 * Componente auxiliar que ajusta zoom/centro do mapa quando os HGUs mudam.
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
 * Voa pra posição do usuário sempre que `trigger` mudar.
 * Usado pelo botão "Me localizar" no mapa.
 */
function RecenterOnUser({ userPosition, trigger }) {
  const map = useMap()
  useEffect(() => {
    if (trigger > 0 && userPosition) {
      map.flyTo([userPosition.lat, userPosition.lng], 16, { duration: 0.8 })
    }
  }, [trigger, userPosition, map])
  return null
}

/**
 * Foca um HGU específico (voa até ele e abre o popup) quando focusRequest muda.
 * Usado pelo botão "Mostrar no mapa" da tela de Detalhe.
 */
function FocusController({ focusRequest, hgus, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (!focusRequest?.hguId) return
    const hgu = hgus.find((h) => h.id === focusRequest.hguId)
    if (!hgu?.location?.lat) return
    map.flyTo([hgu.location.lat, hgu.location.lng], 17, { duration: 0.8 })
    // Abre o popup depois que a animação termina e o marker já renderizou
    const t = setTimeout(() => {
      const marker = markerRefs.current[focusRequest.hguId]
      if (marker) marker.openPopup()
    }, 900)
    return () => clearTimeout(t)
    // ts dentro do focusRequest garante refire mesmo pro mesmo HGU
  }, [focusRequest, hgus, map, markerRefs])
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

export function MapView({ hgus, userPosition, onSelectHgu, recenterTrigger = 0, focusRequest = null }) {
  // Guarda refs dos markers por id pra abrir o popup programaticamente
  const markerRefs = useRef({})

  // Só pinos para HGUs com coordenadas válidas
  const positioned = useMemo(
    () => hgus.filter((h) => h.location?.lat != null && h.location?.lng != null),
    [hgus]
  )

  // Bounds = só os HGUs (não inclui usuário pra não refit a cada update de GPS).
  // O fit inicial centraliza no usuário via `initialCenter`.
  const bounds = useMemo(
    () => positioned.map((h) => [h.location.lat, h.location.lng]),
    [positioned]
  )

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
      <RecenterOnUser userPosition={userPosition} trigger={recenterTrigger} />
      <FocusController focusRequest={focusRequest} hgus={positioned} markerRefs={markerRefs} />

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
            ref={(el) => {
              if (el) markerRefs.current[hgu.id] = el
            }}
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
