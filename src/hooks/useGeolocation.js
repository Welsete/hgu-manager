import { useCallback, useState } from 'react'

/**
 * Hook para capturar a localização atual via GPS do navegador.
 * Não captura automaticamente — chame requestLocation() no clique do botão
 * para que o navegador peça permissão no momento certo.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null) // { lat, lng, accuracy }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Este dispositivo não suporta geolocalização.')
      return Promise.reject(new Error('no-geolocation'))
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          }
          setCoords(result)
          setLoading(false)
          resolve(result)
        },
        (err) => {
          let msg = 'Erro ao obter localização.'
          if (err.code === 1) msg = 'Permissão de GPS negada. Habilite nas configurações do navegador.'
          else if (err.code === 2) msg = 'Posição indisponível. Verifique se o GPS está ativado.'
          else if (err.code === 3) msg = 'Tempo esgotado para obter o GPS. Tente novamente em local aberto.'
          setError(msg)
          setLoading(false)
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      )
    })
  }, [])

  const reset = useCallback(() => {
    setCoords(null)
    setError(null)
  }, [])

  return { coords, loading, error, requestLocation, reset }
}
