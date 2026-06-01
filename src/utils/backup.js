// Backup completo (.json) — inclui fotos, categorias e timestamps.
import { listHgus, listCategories, addCategory, restoreHgus } from './storage.js'

const BACKUP_VERSION = 1

function buildBackup() {
  return {
    app: 'well-hgu',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    hgus: listHgus(),
    categories: listCategories()
  }
}

/**
 * Gera um arquivo .json com todos os dados e dispara o download.
 */
export function downloadBackup() {
  const data = buildBackup()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  a.download = `well-hgu-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 500)
  return { count: data.hgus.length }
}

/**
 * Lê um arquivo .json escolhido pelo usuário e devolve os dados validados.
 * @returns {Promise<{ hgus: Array, categories: Array }|null>}
 */
export async function readBackupFile(file) {
  if (!file) return null
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!data || !Array.isArray(data.hgus)) return null
    return {
      hgus: data.hgus,
      categories: Array.isArray(data.categories) ? data.categories : []
    }
  } catch {
    return null
  }
}

/**
 * Restaura tudo: dispositivos + categorias. Pula duplicados (mesmo SSID+SLID).
 */
export function restoreBackup(data) {
  if (!data) return { added: 0, skipped: 0, categoriesAdded: 0 }

  let categoriesAdded = 0
  for (const c of data.categories || []) {
    const before = listCategories()
    addCategory(c)
    const after = listCategories()
    if (after.length > before.length) categoriesAdded++
  }

  const r = restoreHgus(data.hgus)
  return { ...r, categoriesAdded }
}
