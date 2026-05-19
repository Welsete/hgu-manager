import { useEffect, useMemo, useState } from 'react'
import { MapView } from '../components/MapView.jsx'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { listHgus } from '../utils/storage.js'

export function MapaScreen({ onNewHgu, onSelectHgu }) {
  const [hgus, setHgus] = useState([])
  const { coords, requestLocation, error: gpsError, loading: gpsLoading } = useGeolocation()

  useEffect(() => {
    setHgus(listHgus())
    // Tenta pegar GPS automaticamente ao abrir o mapa
    requestLocation().catch(() => {
      // erro já tratado pelo hook
    })
  }, [requestLocation])

  const withoutGps = useMemo(
    () => hgus.filter((h) => !h.location?.lat).length,
    [hgus]
  )

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="px-4 py-3 flex items-center gap-2">
          <h1 className="text-lg font-bold flex-1">
            <span className="text-emerald-400">●</span> HGU Manager
          </h1>
          <span className="text-slate-400 text-sm">
            {hgus.length} HGU{hgus.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <div className="flex-1 relative">
        <MapView
          hgus={hgus}
          userPosition={coords}
          onSelectHgu={onSelectHgu}
        />

        {/* Badge: HGUs sem GPS cadastrado */}
        {withoutGps > 0 && (
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg">
            + {withoutGps} sem GPS
          </div>
        )}

        {/* Aviso de erro do GPS */}
        {gpsError && (
          <div className="absolute top-3 right-3 z-[400] max-w-[60%] bg-red-950/90 backdrop-blur border border-red-800 rounded-lg px-3 py-2 text-xs text-red-200 shadow-lg">
            {gpsError}
          </div>
        )}

        {/* Indicador de carregamento do GPS */}
        {gpsLoading && !coords && (
          <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-lg">
            Capturando GPS…
          </div>
        )}

        {/* Botão flutuante de cadastro */}
        <button
          type="button"
          onClick={onNewHgu}
          className="absolute bottom-6 right-6 z-[400] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-full w-16 h-16 shadow-xl flex items-center justify-center text-3xl font-bold transition"
          aria-label="Cadastrar novo HGU"
        >
          +
        </button>

        {/* Estado vazio — nenhum HGU cadastrado */}
        {hgus.length === 0 && (
          <div className="absolute inset-x-4 bottom-28 z-[400] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-center text-slate-300 text-sm shadow-lg">
            Nenhum HGU cadastrado ainda. Toque no <strong className="text-emerald-400">+</strong> para começar.
          </div>
        )}
      </div>
    </div>
  )
}
