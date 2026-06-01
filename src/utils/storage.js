// Camada de persistência local.
// Mantém todos os dispositivos em uma única chave do localStorage como JSON.

const STORAGE_KEY = 'hgu-manager:hgus:v1'
const CATEGORIES_KEY = 'hgu-manager:categories:v1'

// Tipos conhecidos (seed). O usuário pode adicionar mais.
const DEFAULT_CATEGORIES = ['dispositivo 5', 'dispositivo 5 HPNA', 'dispositivo 6', 'dispositivo com voz']

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Falha ao ler dispositivos do localStorage:', err)
    return []
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    try { window.dispatchEvent(new CustomEvent('hgu-storage-change')) } catch {}
    return true
  } catch (err) {
    console.error('Falha ao salvar dispositivos no localStorage:', err)
    return false
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
}

export function listHgus() {
  return readAll().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export function getHgu(id) {
  return readAll().find((h) => h.id === id) || null
}

export function createHgu(input) {
  const errors = validateHguInput(input)
  if (errors.length > 0) {
    const err = new Error('Dados inválidos: ' + errors.join(', '))
    err.fields = errors
    throw err
  }

  const list = readAll()
  const hgu = {
    id: generateId(),
    ssid: input.ssid.trim(),
    type: input.type?.trim() || '',
    wifiPassword: input.wifiPassword.trim(),
    modemPassword: input.modemPassword.trim(),
    slid: input.slid.trim(),
    address: input.address?.trim() || '',
    photo: input.photo || null,
    note: input.note?.trim() || '',
    location: input.location || null,
    createdAt: new Date().toISOString(),
    lastMagicToolUse: null
  }

  list.push(hgu)
  const ok = writeAll(list)
  if (!ok) throw new Error('Sem espaço para salvar (localStorage cheio). Tente sem foto.')
  return hgu
}

export function updateHgu(id, patch) {
  const list = readAll()
  const idx = list.findIndex((h) => h.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  writeAll(list)
  return list[idx]
}

export function deleteHgu(id) {
  const list = readAll().filter((h) => h.id !== id)
  return writeAll(list)
}

export function countHgus() {
  return readAll().length
}

/**
 * Importa dispositivos recebidos de um link compartilhado.
 * Gera novos ids, pula duplicados (SSID+SLID), e NÃO carrega fotos.
 */
export function importHgus(incoming) {
  if (!Array.isArray(incoming)) return { added: 0, skipped: 0 }
  const list = readAll()
  let added = 0
  let skipped = 0
  for (const item of incoming) {
    if (!item?.ssid || !item?.slid) { skipped++; continue }
    const dup = list.some((h) => h.slid === item.slid && h.ssid === item.ssid)
    if (dup) { skipped++; continue }
    list.push({
      id: generateId(),
      ssid: String(item.ssid).trim(),
      type: item.type?.trim() || '',
      wifiPassword: item.wifiPassword || '',
      modemPassword: item.modemPassword || '',
      slid: String(item.slid).trim(),
      address: item.address?.trim() || '',
      photo: null,
      note: item.note?.trim() || '',
      location: item.location || null,
      createdAt: new Date().toISOString(),
      lastMagicToolUse: item.lastMagicToolUse || null
    })
    added++
  }
  writeAll(list)
  return { added, skipped }
}

/**
 * Restaura dispositivos a partir de um backup completo (.json).
 * Preserva foto, createdAt e lastMagicToolUse. Pula duplicados por SSID+SLID.
 */
export function restoreHgus(incoming) {
  if (!Array.isArray(incoming)) return { added: 0, skipped: 0 }
  const list = readAll()
  let added = 0
  let skipped = 0
  for (const item of incoming) {
    if (!item?.ssid || !item?.slid) { skipped++; continue }
    const dup = list.some((h) => h.slid === item.slid && h.ssid === item.ssid)
    if (dup) { skipped++; continue }
    list.push({
      id: generateId(),
      ssid: String(item.ssid).trim(),
      type: item.type?.trim() || '',
      wifiPassword: item.wifiPassword || '',
      modemPassword: item.modemPassword || '',
      slid: String(item.slid).trim(),
      address: item.address?.trim() || '',
      photo: item.photo || null,
      note: item.note?.trim() || '',
      location: item.location || null,
      createdAt: item.createdAt || new Date().toISOString(),
      lastMagicToolUse: item.lastMagicToolUse || null
    })
    added++
  }
  writeAll(list)
  return { added, skipped }
}

export function registerMagicToolUse(id) {
  return updateHgu(id, { lastMagicToolUse: new Date().toISOString() })
}

export function validateHguInput(input) {
  const errors = []
  if (!input?.ssid?.trim()) errors.push('SSID')
  if (!input?.wifiPassword?.trim()) errors.push('Senha de rede')
  if (!input?.modemPassword?.trim()) errors.push('Senha admin')
  if (!input?.slid?.trim()) errors.push('Código')
  return errors
}

// ----- Categorias / tipos -----

function writeCategories(list) {
  try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list)) } catch {}
}

export function listCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (!raw) {
      writeCategories(DEFAULT_CATEGORIES)
      return [...DEFAULT_CATEGORIES]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_CATEGORIES]
  } catch {
    return [...DEFAULT_CATEGORIES]
  }
}

export function addCategory(name) {
  const clean = (name || '').trim()
  if (!clean) return listCategories()
  const list = listCategories()
  if (!list.some((c) => c.toLowerCase() === clean.toLowerCase())) {
    list.push(clean)
    list.sort((a, b) => a.localeCompare(b, 'pt-BR'))
    writeCategories(list)
  }
  return list
}

export function deleteCategory(name) {
  const list = listCategories().filter((c) => c !== name)
  writeCategories(list)
  return list
}
