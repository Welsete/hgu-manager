// Geocodificação reversa via Nominatim (OpenStreetMap) — grátis, sem API key.
// Política de uso: max 1 req/s, requer User-Agent (browsers já enviam).
// Docs: https://nominatim.org/release-docs/develop/api/Reverse/

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/**
 * Converte coordenadas em um endereço formatado.
 * @returns {Promise<string|null>} endereço amigável ou null se falhou
 */
export async function reverseGeocode(lat, lng, signal) {
  const url = `${NOMINATIM}?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR&zoom=18`
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.display_name) return null
    return formatAddress(data) || data.display_name
  } catch (err) {
    if (err.name === 'AbortError') return null
    console.warn('reverseGeocode falhou:', err)
    return null
  }
}

/**
 * Monta um endereço compacto a partir dos campos retornados pelo Nominatim.
 * Padrão: "Rua, número, bairro, cidade - UF".
 */
function formatAddress(data) {
  const a = data.address || {}
  const street = a.road || a.pedestrian || a.path || ''
  const number = a.house_number || ''
  const neighborhood = a.suburb || a.neighbourhood || a.quarter || ''
  const city = a.city || a.town || a.village || a.municipality || ''
  const state = a.state_code || a.state || ''

  const parts = []
  if (street) parts.push(number ? `${street}, ${number}` : street)
  if (neighborhood) parts.push(neighborhood)
  if (city) parts.push(state ? `${city} - ${state}` : city)
  return parts.join(', ')
}
