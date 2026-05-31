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

const DEFAULT_CENTER = [-23.5505, -46.6333] // São Paulo
const DEFAULT_ZOOM = 13

/**
 * Faz fit dos pinos quando os dispositivos mudam.
 * Se `skipInitialRef.current === true`, pula o PRIMEIRO fit (pra não atrapalhar
 * um foco específico que acabou de chegar).
 */
function FitBounds({ points, skipInitialRef }) {
  const map = useMap()
  const didFit = useRef(false)
  useEffect(() => {
    if (!points || points.length === 0) return
    if (!didFit.current && skipInitialRef?.current) {
      didFit.current = true
      return
    }
    if (points.length === 1) {
      map.setView(points[0], 16)
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 16 })
    }
    didFit.current = true
  }, [map, points, skipInitialRef])
  return null
}

/**
 * Voa pra posição do usuário sempre que `trigger` mudar (botão Me localizar).
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
 * Foca um dispositivo específico (voa e abre o popup) quando focusRequest muda.
 * Pequeno atraso garante que rode após qualquer fit-bounds inicial.
 */
function FocusController({ focusRequest, hgus, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (!focusRequest?.hguId) return
    const hgu = hgus.find((h) => h.id === focusRequest.hguId)
    if (!hgu?.location?.lat) return
    const flyT = setTimeout(() => {
      map.flyTo([hgu.location.lat, hgu.location.lng], 17, { duration: 0.6 })
    }, 120)
    const popupT = setTimeout(() => {
      const marker = markerRefs.current[focusRequest.hguId]
      if (marker) marker.openPopup()
    }, 900)
    return () => {
      clearTimeout(flyT)
      clearTimeout(popupT)
    }
  }, [focusRequest, hgus, map, markerRefs])
  return null
}

/**
 * Ícone de pino. Quando `focused` é true, vira um pino maior com anel pulsante.
 */
function makePinIcon(color, focused) {
  if (focused) {
    return L.divIcon({
      className: '',
      html: `
        <div style="position: relative; width: 40px; height: 40px;">
          <div style="
            position: absolute; inset: -10px;
            border: 3px solid ${color};
            border-radius: 50%;
            opacity: 0.6;
            animation: hgu-pulse 1.5s ease-out infinite;
          "></div>
          <div style="
            position: absolute; inset: 0;
            background: ${color};
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.7);
          "></div>
        </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    })
  }
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
  const markerRefs = useRef({})
  // Capturado UMA vez no primeiro render: se há foco pendente, pula o fit inicial
  const skipInitialFitRef = useRef(!!focusRequest?.hguId)

  const positioned = useMemo(
    () => hgus.filter((h) => h.location?.lat != null && h.location?.lng != null),
    [hgus]
  )

  const bounds = useMemo(
    () => positioned.map((h) => [h.location.lat, h.location.lng]),
    [positioned]
  )

  const initialCenter = userPosition
    ? [userPosition.lat, userPosition.lng]
    : positioned[0]
    ? [positioned[0].location.lat, positioned[0].location.lng]
    : DEFAULT_CENTER

  const focusedId = focusRequest?.hguId || null

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

      <FitBounds points={bounds} skipInitialRef={skipInitialFitRef} />
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
        const isFocused = focusedId === hgu.id
        return (
          <Marker
            key={hgu.id}
            position={[hgu.location.lat, hgu.location.lng]}
            icon={makePinIcon(color, isFocused)}
            zIndexOffset={isFocused ? 1000 : 0}
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
