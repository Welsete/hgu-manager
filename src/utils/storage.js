// Camada de persistência local para HGUs.
// Mantém todos os HGUs em uma única chave do localStorage como JSON.
// Nas próximas iterações pode migrar para IndexedDB ou Firestore sem mudar a API.

const STORAGE_KEY = 'hgu-manager:hgus:v1'
const CATEGORIES_KEY = 'hgu-manager:categories:v1'

// Tipos de HGU conhecidos (seed). O usuário pode adicionar mais.
const DEFAULT_CATEGORIES = ['HGU 5', 'HGU 5 HPNA', 'HGU 6', 'HGU com telefone']

/**
 * @typedef {Object} HGU
 * @property {string} id            - UUID gerado no cadastro
 * @property {string} ssid          - Nome da rede WiFi
 * @property {string} type          - Tipo/categoria do HGU (ex: "HGU 6")
 * @property {string} wifiPassword  - Senha da rede WiFi
 * @property {string} modemPassword - Senha do painel admin do modem
 * @property {string} slid          - Serial do equipamento
 * @property {string} [address]     - Endereço (texto)
 * @property {string} [photo]       - Foto opcional em data URL (base64)
 * @property {string} [note]        - Anotação livre opcional
 * @property {{ lat: number, lng: number, accuracy?: number } | null} location
 * @property {string} createdAt     - ISO timestamp do cadastro
 * @property {string | null} lastMagicToolUse - ISO timestamp do último uso
 */

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Falha ao ler HGUs do localStorage:', err)
    return []
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch (err) {
    // Quota excedida geralmente acontece com fotos grandes em base64
    console.error('Falha ao salvar HGUs no localStorage:', err)
    return false
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'hgu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
}

export function listHgus() {
  return readAll().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export function getHgu(id) {
  return readAll().find((h) => h.id === id) || null
}

/**
 * Cria um novo HGU. Retorna o objeto criado ou lança erro de validação.
 * @param {Partial<HGU>} input
 */
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
 * Marca uso do Magic Tool agora.
 */
export function registerMagicToolUse(id) {
  return updateHgu(id, { lastMagicToolUse: new Date().toISOString() })
}

/**
 * Validação simples — campos obrigatórios.
 * @param {Partial<HGU>} input
 * @returns {string[]} lista de campos com erro
 */
export function validateHguInput(input) {
  const errors = []
  if (!input?.ssid?.trim()) errors.push('SSID')
  if (!input?.wifiPassword?.trim()) errors.push('Senha WiFi')
  if (!input?.modemPassword?.trim()) errors.push('Senha do modem')
  if (!input?.slid?.trim()) errors.push('SLID')
  return errors
}

// ---------------------------------------------------------------------------
// Categorias / tipos de HGU (editáveis pelo usuário)
// ---------------------------------------------------------------------------

function writeCategories(list) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Falha ao salvar categorias:', err)
  }
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

/**
 * Adiciona uma categoria (se não existir, ignorando maiúsc/minúsc) e devolve a lista atualizada.
 */
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
