import { useGeolocation } from '../hooks/useGeolocation.js'

/**
 * Botão para capturar GPS + display da coordenada e precisão.
 * Recebe `value` ({ lat, lng, accuracy } | null) e `onChange`.
 */
export function GpsField({ value, onChange, disabled }) {
  const { loading, error, requestLocation } = useGeolocation()

  async function handleClick() {
    try {
      const result = await requestLocation()
      onChange(result)
    } catch {
      // erro já tratado pelo hook
    }
  }

  return (
    <div>
      <label className="label-base">Localização GPS</label>

      {value ? (
        <div className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 text-sm space-y-1">
          <div className="text-slate-200">
            <span className="text-slate-400">Lat:</span> {value.lat.toFixed(6)}
            <span className="text-slate-400 ml-3">Lng:</span> {value.lng.toFixed(6)}
          </div>
          {value.accuracy != null && (
            <div className="text-slate-400 text-xs">
              Precisão: ±{Math.round(value.accuracy)} m
            </div>
          )}
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || loading}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium pt-1"
          >
            {loading ? 'Atualizando…' : 'Recapturar GPS'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || loading}
          className="btn-secondary"
        >
          {loading ? 'Capturando GPS…' : 'Capturar localização atual'}
        </button>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
      {!value && !error && (
        <p className="text-slate-500 text-xs mt-1">
          O navegador vai pedir permissão para acessar sua localização.
        </p>
      )}
    </div>
  )
}
