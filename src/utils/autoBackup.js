// Backup automático usando File System Access API.
// O usuário escolhe um arquivo uma vez; o app o reescreve a cada mudança.

import { idbGet, idbSet, idbDel } from './idb.js'
import { listHgus, listCategories } from './storage.js'

const HANDLE_KEY = 'auto-backup-handle'
const LAST_SYNC_KEY = 'well-hgu:auto-backup-last-sync'

export function isFSASupported() {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window
}

async function verifyPermission(handle, write = true) {
  const opts = { mode: write ? 'readwrite' : 'read' }
  try {
    if ((await handle.queryPermission(opts)) === 'granted') return true
    if ((await handle.requestPermission(opts)) === 'granted') return true
    return false
  } catch {
    return false
  }
}

function buildPayload() {
  return {
    app: 'well-hgu',
    version: 1,
    exportedAt: new Date().toISOString(),
    hgus: listHgus(),
    categories: listCategories()
  }
}

/**
 * Pede pro usuário escolher o arquivo de backup e salva a referência.
 * Já dispara o primeiro save imediato.
 */
export async function enableAutoBackup() {
  if (!isFSASupported()) {
    throw new Error('Backup automático não suportado neste navegador. Use Chrome ou Edge.')
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const handle = await window.showSaveFilePicker({
    suggestedName: `well-hgu-backup-${date}.json`,
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
  })
  await idbSet(HANDLE_KEY, handle)
  return await syncNow()
}

export async function disableAutoBackup() {
  await idbDel(HANDLE_KEY)
  try { localStorage.removeItem(LAST_SYNC_KEY) } catch {}
}

export async function isAutoBackupEnabled() {
  try {
    const h = await idbGet(HANDLE_KEY)
    return !!h
  } catch {
    return false
  }
}

/**
 * Sincroniza o estado atual no arquivo configurado.
 * @returns {Promise<{ ok: boolean, reason?: string, ts?: number }>}
 */
export async function syncNow() {
  const handle = await idbGet(HANDLE_KEY)
  if (!handle) return { ok: false, reason: 'no-handle' }
  const granted = await verifyPermission(handle, true)
  if (!granted) return { ok: false, reason: 'permission' }
  try {
    const data = buildPayload()
    const writable = await handle.createWritable()
    await writable.write(JSON.stringify(data, null, 2))
    await writable.close()
    const now = Date.now()
    try { localStorage.setItem(LAST_SYNC_KEY, String(now)) } catch {}
    return { ok: true, ts: now }
  } catch (err) {
    console.warn('Auto-backup falhou:', err)
    return { ok: false, reason: 'write-failed' }
  }
}

export function getLastSync() {
  try {
    const v = localStorage.getItem(LAST_SYNC_KEY)
    return v ? parseInt(v, 10) : null
  } catch {
    return null
  }
}

// Debounce pra não rajadar I/O em mudanças sequenciais
let saveTimer = null
function debouncedSync() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { syncNow().catch(() => {}) }, 800)
}

let initialized = false
/**
 * Liga o listener que reage a mudanças do storage e dispara auto-save.
 * Chame uma vez no App.
 */
export function initAutoBackupListener() {
  if (initialized) return
  initialized = true
  window.addEventListener('hgu-storage-change', debouncedSync)
}
