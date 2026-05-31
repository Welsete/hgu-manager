import { useEffect, useMemo, useState } from 'react'
import { MapView } from '../components/MapView.jsx'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { listHgus } from '../utils/storage.js'
import { CreditLink } from '../components/CreditLink.jsx'

export function MapaScreen({ onNewHgu, onSelectHgu, onOpenList, userPosition, onUserPositionChange, focusRequest }) {
  const [hgus, setHgus] = useState([])
  const { coords, requestLocation, error: gpsError, loading: gpsLoading } = useGeolocation()
  const [recenterTrigger, setRecenterTrigger] = useState(0)

  useEffect(() => {
    setHgus(listHgus())
    // Tenta pegar GPS automaticamente ao abrir o mapa
    requestLocation().catch(() => {})
  }, [requestLocation])

  // Propaga a posição pra outras telas (Lista usa)
  useEffect(() => {
    if (coords) onUserPositionChange?.(coords)
  }, [coords, onUserPositionChange])

  // Posição atual = nova captura OU última conhecida vinda do App
  const currentPos = coords || userPosition

  const withoutGps = useMemo(
    () => hgus.filter((h) => !h.location?.lat).length,
    [hgus]
  )

  function handleLocateMe() {
    requestLocation()
      .then(() => setRecenterTrigger((t) => t + 1))
      .catch(() => {
        // se já tem coords mas falhou pegar nova, ainda assim recentraliza
        if (currentPos) setRecenterTrigger((t) => t + 1)
      })
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-slate-950">
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 shrink-0">
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="brand-dot"></span>
              <span className="brand-text">Well HGU</span>
            </h1>
            <CreditLink size="large" />
          </div>
          <span className="text-slate-400 text-sm shrink-0">
            {hgus.length} disp.
          </span>
          <button
            type="button"
            onClick={onOpenList}
            className="ml-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 text-sm font-semibold transition shrink-0"
            aria-label="Ver lista"
            title="Lista"
          >
            ☰ Lista
          </button>
        </div>
        <div className="px-4 pb-2"></div>
      </header>

      <div className="flex-1 relative">
        <MapView
          hgus={hgus}
          userPosition={currentPos}
          onSelectHgu={onSelectHgu}
          recenterTrigger={recenterTrigger}
          focusRequest={focusRequest}
        />

        {/* Badge: dispositivos sem GPS cadastrado */}
        {withoutGps > 0 && (
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg">
            + {withoutGps} sem GPS
          </div>
        )}

        {/* Aviso de erro do GPS */}
        {gpsError && !gpsLoading && (
          <div className="absolute top-3 right-3 z-[400] max-w-[60%] bg-red-950/90 backdrop-blur border border-red-800 rounded-lg px-3 py-2 text-xs text-red-200 shadow-lg">
            {gpsError}
          </div>
        )}

        {/* Indicador de carregamento do GPS */}
        {gpsLoading && !currentPos && (
          <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg">
            Capturando GPS…
          </div>
        )}

        {/* Botão "Me localizar" */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={gpsLoading}
          className="absolute bottom-6 left-6 z-[400] bg-slate-900/95 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center text-2xl transition disabled:opacity-50"
          aria-label="Me localizar"
          title="Me localizar"
        >
          {gpsLoading ? '⏳' : '📍'}
        </button>

        {/* Botão flutuante de cadastro */}
        <button
          type="button"
          onClick={onNewHgu}
          className="absolute bottom-6 right-6 z-[400] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-full w-16 h-16 shadow-xl flex items-center justify-center text-3xl font-bold transition"
          aria-label="Cadastrar novo"
        >
          +
        </button>

        {/* Estado vazio — nenhum dispositivo cadastrado */}
        {hgus.length === 0 && (
          <div className="absolute inset-x-4 bottom-28 z-[400] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-center text-slate-300 text-sm shadow-lg">
            Nenhum dispositivo cadastrado ainda. Toque no <strong className="text-emerald-400">+</strong> para começar.
          </div>
        )}
      </div>
    </div>
  )
}
