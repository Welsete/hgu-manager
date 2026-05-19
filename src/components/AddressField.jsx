import { useEffect, useRef, useState } from 'react'
import { TextField } from './TextField.jsx'
import { reverseGeocode } from '../utils/geocoding.js'

/**
 * Campo de endereço com auto-preenchimento via reverse geocoding.
 * Quando o usuário captura GPS e o campo está vazio, busca o endereço sozinho.
 * Editável a qualquer momento.
 */
export function AddressField({ value, onChange, location }) {
  const [autoFilling, setAutoFilling] = useState(false)
  const [autoMsg, setAutoMsg] = useState(null)
  const lastLocationRef = useRef(null)

  useEffect(() => {
    if (!location?.lat || !location?.lng) return
    // Evita refetch repetido pra mesma coordenada
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

  return (
    <TextField
      label="Endereço"
      value={value}
      onChange={onChange}
      placeholder={autoFilling ? 'Buscando endereço…' : 'Ex: Rua das Flores, 123, Centro'}
      hint={autoMsg || (autoFilling ? null : 'Preenche automaticamente quando captura o GPS')}
    />
  )
}
