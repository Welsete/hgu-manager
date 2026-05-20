import { useEffect, useRef, useState } from 'react'
import { TextField } from './TextField.jsx'
import { reverseGeocode, forwardGeocode } from '../utils/geocoding.js'

/**
 * Campo de endereço com dois caminhos:
 *  1. GPS -> endereço: quando captura GPS e o campo está vazio, busca o endereço sozinho.
 *  2. Endereço -> GPS: botão "Localizar pelo endereço" acha as coordenadas a partir do
 *     texto digitado (pra cadastrar HGU sem estar no local).
 */
export function AddressField({ value, onChange, location, onLocationFromAddress }) {
  const [autoFilling, setAutoFilling] = useState(false)
  const [autoMsg, setAutoMsg] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchMsg, setSearchMsg] = useState(null)
  const lastLocationRef = useRef(null)

  useEffect(() => {
    if (!location?.lat || !location?.lng) return
    const key = `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`
    if (lastLocationRef.current === key) return
    lastLocationRef.current = key

    // Só auto-preenche se o campo estiver vazio (não sobrescreve o que o usuário digitou)
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

  async function handleSearch() {
    if (!value || !value.trim()) {
      setSearchMsg('Digite o endereço primeiro.')
      return
    }
    setSearching(true)
    setSearchMsg(null)
    const result = await forwardGeocode(value)
    setSearching(false)
    if (result) {
      // Marca o ref pra evitar que o reverse sobrescreva o endereço digitado
      lastLocationRef.current = `${result.lat.toFixed(5)},${result.lng.toFixed(5)}`
      onLocationFromAddress?.({ lat: result.lat, lng: result.lng })
      setSearchMsg('Local encontrado e marcado no mapa.')
    } else {
      setSearchMsg('Endereço não encontrado. Tente ser mais específico (rua, número, cidade).')
    }
  }

  return (
    <div className="space-y-2">
      <TextField
        label="Endereço"
        value={value}
        onChange={onChange}
        placeholder={autoFilling ? 'Buscando endereço…' : 'Ex: Rua das Flores, 123, Centro, Cidade'}
        hint={autoMsg || (autoFilling ? null : 'Preenche sozinho ao capturar GPS — ou digite e use o botão abaixo')}
      />

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
