import { useEffect, useRef, useState } from 'react'
import { TextField } from './TextField.jsx'
import { reverseGeocode, forwardGeocode, searchAddresses } from '../utils/geocoding.js'

/**
 * Campo de endereço com 3 ajudas:
 *  1. GPS -> endereço (auto-fill quando captura GPS e o campo está vazio).
 *  2. Endereço -> GPS (botão "Localizar pelo endereço" usa o texto digitado).
 *  3. Autocomplete enquanto digita (debounce, dropdown com sugestões).
 */
export function AddressField({ value, onChange, location, onLocationFromAddress }) {
  const [autoFilling, setAutoFilling] = useState(false)
  const [autoMsg, setAutoMsg] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchMsg, setSearchMsg] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const lastLocationRef = useRef(null)
  const debounceRef = useRef(null)
  const lastQueryRef = useRef('')
  const justPickedRef = useRef(false) // evita rebuscar após escolher sugestão

  // Reverse geocode: GPS -> endereço (só se campo vazio)
  useEffect(() => {
    if (!location?.lat || !location?.lng) return
    const key = `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`
    if (lastLocationRef.current === key) return
    lastLocationRef.current = key
    if (value && value.trim().length > 0) return

    const ctrl = new AbortController()
    setAutoFilling(true)
    setAutoMsg(null)
    reverseGeocode(location.lat, location.lng, ctrl.signal).then((addr) => {
      setAutoFilling(false)
      if (addr) {
        onChange(addr)
        setAutoMsg('Endereço preenchido a partir do GPS. Edite se precisar.')
      } else {
        setAutoMsg('Não consegui buscar o endereço. Preencha manualmente.')
      }
    })
    return () => ctrl.abort()
  }, [location, value, onChange])

  // Recebe o que o usuário digitou: notifica parent + dispara autocomplete debounced
  function handleType(newVal) {
    onChange(newVal)
    if (justPickedRef.current) {
      // recém-escolhido — não rebuscar nessa mudança
      justPickedRef.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = newVal.trim()
    if (q.length < 5) {
      setSuggestions([])
      setShowSugg(false)
      return
    }
    if (q === lastQueryRef.current) return
    debounceRef.current = setTimeout(async () => {
      lastQueryRef.current = q
      const results = await searchAddresses(q)
      setSuggestions(results)
      setShowSugg(results.length > 0)
    }, 500)
  }

  function pickSuggestion(s) {
    justPickedRef.current = true
    // Marca a coord pra impedir que o reverse sobrescreva o texto
    lastLocationRef.current = `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`
    onChange(s.shortName || s.displayName)
    onLocationFromAddress?.({ lat: s.lat, lng: s.lng })
    setSuggestions([])
    setShowSugg(false)
    setSearchMsg('Endereço selecionado e marcado no mapa.')
  }

  async function handleSearch() {
    if (!value || !value.trim()) {
      setSearchMsg('Digite o endereço primeiro.')
      return
    }
    setSearching(true)
    setSearchMsg(null)
    setShowSugg(false)
    const result = await forwardGeocode(value)
    setSearching(false)
    if (result) {
      lastLocationRef.current = `${result.lat.toFixed(5)},${result.lng.toFixed(5)}`
      onLocationFromAddress?.({ lat: result.lat, lng: result.lng })
      setSearchMsg('Local encontrado e marcado no mapa.')
    } else {
      setSearchMsg('Endereço não encontrado. Tente ser mais específico (rua, número, cidade).')
    }
  }

  return (
    <div className="space-y-2 relative">
      <TextField
        label="Endereço"
        value={value}
        onChange={handleType}
        placeholder={autoFilling ? 'Buscando endereço…' : 'Comece a digitar — aparecem sugestões'}
        hint={autoMsg || (autoFilling ? null : 'Digite e escolha uma sugestão, ou use o GPS / o botão abaixo')}
      />

      {/* Dropdown de sugestões */}
      {showSugg && suggestions.length > 0 && (
        <div className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shadow-lg">
          {suggestions.map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => pickSuggestion(s)}
              className="w-full text-left px-3 py-2 hover:bg-slate-700 active:bg-slate-900 border-b border-slate-700 last:border-b-0"
            >
              <div className="text-slate-100 text-sm font-medium truncate">{s.shortName}</div>
              <div className="text-slate-400 text-xs truncate">{s.displayName}</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowSugg(false)}
            className="w-full text-center text-slate-400 text-xs py-1 hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
      )}

      {onLocationFromAddress && (
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="btn-secondary text-sm"
        >
          {searching ? 'Localizando…' : '🔎 Localizar pelo endereço (sem precisar estar no local)'}
        </button>
      )}

      {searchMsg && <p className="text-slate-400 text-xs">{searchMsg}</p>}
    </div>
  )
}
