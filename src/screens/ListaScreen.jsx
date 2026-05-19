import { useEffect, useMemo, useState } from 'react'
import { listHgus } from '../utils/storage.js'
import { getAvailability, statusColor, statusLabel } from '../utils/availability.js'
import { haversine, formatDistance } from '../utils/distance.js'

const FILTERS = {
  ALL: 'all',
  AVAILABLE: 'available'
}

export function ListaScreen({ userPosition, onBack, onSelectHgu }) {
  const [hgus, setHgus] = useState([])
  const [filter, setFilter] = useState(FILTERS.ALL)

  useEffect(() => {
    setHgus(listHgus())
  }, [])

  // Lista enriquecida com status e distância
  const enriched = useMemo(() => {
    return hgus.map((h) => {
      const av = getAvailability(h)
      const distance =
        userPosition && h.location?.lat
          ? haversine(userPosition.lat, userPosition.lng, h.location.lat, h.location.lng)
          : null
      return { ...h, _availability: av, _distance: distance }
    })
  }, [hgus, userPosition])

  const availableCount = useMemo(
    () => enriched.filter((h) => h._availability.status === 'available').length,
    [enriched]
  )

  const items = useMemo(() => {
    const filtered =
      filter === FILTERS.AVAILABLE
        ? enriched.filter((h) => h._availability.status === 'available')
        : enriched

    // Ordena: com distância primeiro (mais próximo), sem distância no fim
    return [...filtered].sort((a, b) => {
      if (a._distance == null && b._distance == null) {
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      }
      if (a._distance == null) return 1
      if (b._distance == null) return -1
      return a._distance - b._distance
    })
  }, [enriched, filter])

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={onBack} className="btn-ghost" type="button">← Mapa</button>
          <h1 className="text-lg font-semibold flex-1 text-center pr-16">HGUs Próximos</h1>
        </div>
        <div className="max-w-xl mx-auto px-4 pb-3 grid grid-cols-2 gap-2">
          <FilterButton
            active={filter === FILTERS.ALL}
            onClick={() => setFilter(FILTERS.ALL)}
            label={`Todos (${enriched.length})`}
          />
          <FilterButton
            active={filter === FILTERS.AVAILABLE}
            onClick={() => setFilter(FILTERS.AVAILABLE)}
            label={`Só disponíveis (${availableCount})`}
          />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-2 pb-20">
        {!userPosition && (
          <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 text-xs text-slate-400 mb-3">
            Sem GPS no momento — distâncias indisponíveis.
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {filter === FILTERS.AVAILABLE
              ? 'Nenhum HGU disponível agora.'
              : 'Nenhum HGU cadastrado ainda.'}
          </div>
        ) : (
          items.map((hgu) => {
            const color = statusColor(hgu._availability.status)
            return (
              <button
                key={hgu.id}
                type="button"
                onClick={() => onSelectHgu?.(hgu)}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-800 rounded-lg p-3 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0 leading-none" style={{ color }}>●</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{hgu.ssid}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {statusLabel(hgu._availability.status)}
                      {hgu.address ? ` · ${hgu.address}` : ''}
                    </div>
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <div className="text-slate-300 font-medium">
                      {formatDistance(hgu._distance)}
                    </div>
                    {!hgu.location && (
                      <div className="text-slate-500 text-xs">sem GPS</div>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </main>
    </div>
  )
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}
