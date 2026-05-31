// Compartilhamento de dispositivos via link (sem servidor).
// Os dados vão codificados em base64url no hash da URL: /#import=<código>.
// A foto NÃO é incluída (deixaria o link grande demais).

const SHARE_VERSION = 1

// Campos que viajam no compartilhamento. Exclui foto, id e data de cadastro
// (id/data são por-dispositivo; foto é pesada).
function pickShareable(hgu) {
  return {
    ssid: hgu.ssid,
    type: hgu.type || '',
    wifiPassword: hgu.wifiPassword,
    modemPassword: hgu.modemPassword,
    slid: hgu.slid,
    address: hgu.address || '',
    note: hgu.note || '',
    location: hgu.location || null,
    lastMagicToolUse: hgu.lastMagicToolUse || null
  }
}

// base64 seguro para UTF-8 (acentos) e para URL
function toBase64Url(str) {
  const b64 = btoa(unescape(encodeURIComponent(str)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  return decodeURIComponent(escape(atob(b64)))
}

export function encodeHgus(hgus) {
  const payload = { v: SHARE_VERSION, hgus: hgus.map(pickShareable) }
  return toBase64Url(JSON.stringify(payload))
}

export function decodeHgus(code) {
  try {
    const data = JSON.parse(fromBase64Url(code))
    if (!data || !Array.isArray(data.hgus)) return null
    return data.hgus
  } catch {
    return null
  }
}

export function buildShareUrl(hgus) {
  return `${window.location.origin}/#import=${encodeHgus(hgus)}`
}

/**
 * Compartilha via Web Share API (abre o menu nativo: WhatsApp, etc).
 * Se não tiver suporte, copia o link pra área de transferência.
 * @returns {Promise<{ ok: boolean, method: 'share'|'clipboard'|'cancel'|'none', url?: string }>}
 */
export async function shareHgus(hgus, title = 'Dispositivo compartilhado') {
  const url = buildShareUrl(hgus)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Well dispositivo', text: title, url })
      return { ok: true, method: 'share' }
    } catch (err) {
      if (err.name === 'AbortError') return { ok: false, method: 'cancel' }
      // qualquer outro erro: cai pro fallback de copiar
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return { ok: true, method: 'clipboard' }
  } catch {
    return { ok: false, method: 'none', url }
  }
}

/**
 * Lê Dispositivos recebidos no hash da URL (#import=...). Retorna array ou null.
 */
export function readImportFromUrl() {
  const hash = window.location.hash || ''
  const m = hash.match(/[#&]import=([^&]+)/)
  if (!m) return null
  return decodeHgus(m[1])
}

/**
 * Limpa o parâmetro de import da URL (sem recarregar a página).
 */
export function clearImportFromUrl() {
  if (window.history?.replaceState) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  } else {
    window.location.hash = ''
  }
}
