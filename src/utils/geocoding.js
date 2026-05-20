// Geocodificação via Nominatim (OpenStreetMap) — grátis, sem API key.
// Política de uso: max 1 req/s, requer User-Agent (browsers já enviam).

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'
const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search'

/**
 * Geocodificação reversa: coordenadas -> endereço formatado.
 * @returns {Promise<string|null>}
 */
export async function reverseGeocode(lat, lng, signal) {
  const url = `${NOMINATIM_REVERSE}?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR&zoom=18`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal })
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
 * Geocodificação direta: endereço em texto -> coordenadas.
 * Usado para cadastrar um HGU sem estar no local.
 * @returns {Promise<{ lat: number, lng: number, displayName: string }|null>}
 */
export async function forwardGeocode(query, signal) {
  if (!query || !query.trim()) return null
  const url =
    `${NOMINATIM_SEARCH}?format=json&q=${encodeURIComponent(query.trim())}` +
    `&limit=1&accept-language=pt-BR&countrycodes=br`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const first = data[0]
    const lat = parseFloat(first.lat)
    const lng = parseFloat(first.lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null
    return { lat, lng, displayName: first.display_name || query }
  } catch (err) {
    if (err.name === 'AbortError') return null
    console.warn('forwardGeocode falhou:', err)
    return null
  }
}

/**
 * Monta um endereço compacto: "Rua, número, bairro, cidade - UF".
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
