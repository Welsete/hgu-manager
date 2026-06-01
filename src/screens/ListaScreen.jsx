import { useEffect, useMemo, useRef, useState } from 'react'
import { listHgus } from '../utils/storage.js'
import { getAvailability, statusColor, statusLabel } from '../utils/availability.js'
import { haversine, formatDistance } from '../utils/distance.js'
import { shareHgus } from '../utils/share.js'
import { downloadBackup, readBackupFile, restoreBackup } from '../utils/backup.js'
import { isAutoBackupEnabled, enableAutoBackup, disableAutoBackup, syncNow, getLastSync, isFSASupported } from '../utils/autoBackup.js'
import { CreditLink } from '../components/CreditLink.jsx'

const FILTERS = {
  ALL: 'all',
  AVAILABLE: 'available'
}

export function ListaScreen({ userPosition, onBack, onSelectHgu }) {
  const [hgus, setHgus] = useState([])
  const [filter, setFilter] = useState(FILTERS.ALL)
  const [typeFilter, setTypeFilter] = useState('')
  const [shareMsg, setShareMsg] = useState(null)
  const fileInputRef = useRef(null)
  const [autoOn, setAutoOn] = useState(false)
  const [autoStatus, setAutoStatus] = useState({ lastSync: null })

  useEffect(() => {
    setHgus(listHgus())
  }, [])

  useEffect(() => {
    let alive = true
    isAutoBackupEnabled().then((on) => {
      if (!alive) return
      setAutoOn(on)
      setAutoStatus({ lastSync: getLastSync() })
    })
    // Atualiza a contagem de último sync periodicamente
    function refresh() { setAutoStatus({ lastSync: getLastSync() }) }
    window.addEventListener('hgu-storage-change', refresh)
    const t = setInterval(refresh, 5000)
    return () => {
      alive = false
      window.removeEventListener('hgu-storage-change', refresh)
      clearInterval(t)
    }
  }, [])

  async function handleEnableAuto() {
    try {
      const r = await enableAutoBackup()
      if (r?.ok) {
        setAutoOn(true)
        setAutoStatus({ lastSync: r.ts })
        setShareMsg('Backup automático ativado.')
        setTimeout(() => setShareMsg(null), 3000)
      } else {
        setShareMsg('Não consegui ativar — permissão negada.')
        setTimeout(() => setShareMsg(null), 3000)
      }
    } catch (err) {
      if (err?.name === 'AbortError') return // usuário cancelou
      setShareMsg(err.message || 'Erro ao ativar backup automático.')
      setTimeout(() => setShareMsg(null), 4000)
    }
  }

  async function handleDisableAuto() {
    if (!window.confirm('Desativar backup automático? O arquivo continua intacto, só para de atualizar.')) return
    await disableAutoBackup()
    setAutoOn(false)
    setAutoStatus({ lastSync: null })
    setShareMsg('Backup automático desativado.')
    setTimeout(() => setShareMsg(null), 3000)
  }

  async function handleManualSync() {
    const r = await syncNow()
    if (r.ok) {
      setAutoStatus({ lastSync: r.ts })
      setShareMsg('Backup sincronizado agora.')
    } else if (r.reason === 'permission') {
      setShareMsg('Permissão negada. Toque em ativar novamente.')
    } else {
      setShareMsg('Não consegui sincronizar.')
    }
    setTimeout(() => setShareMsg(null), 3000)
  }

  function formatAgo(ts) {
    if (!ts) return 'nunca'
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60) return 'agora há pouco'
    if (s < 3600) return `há ${Math.floor(s / 60)} min`
    if (s < 86400) return `há ${Math.floor(s / 3600)} h`
    return `há ${Math.floor(s / 86400)} dia${Math.floor(s / 86400) !== 1 ? 's' : ''}`
  }

  // Lista enriquecida com status e distância
  const enriched = useMemo(() => {
    return hgus.map((h) => {
      const av = getAvailability(h)
      const distance =
        userPosition && h.location?.lat
          ? haversine(userPosition.lat, userPosition.lng, h.location.lat, h.location.lng)
          : null
      return { ...h, _availability: av, _distance: distance }
    })
  }, [hgus, userPosition])

  // Tipos presentes nos Dispositivos cadastrados (pra montar o dropdown)
  const availableTypes = useMemo(() => {
    const set = new Set()
    hgus.forEach((h) => { if (h.type) set.add(h.type) })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [hgus])

  const availableCount = useMemo(
    () => enriched.filter((h) => h._availability.status === 'available').length,
    [enriched]
  )

  const items = useMemo(() => {
    let filtered =
      filter === FILTERS.AVAILABLE
        ? enriched.filter((h) => h._availability.status === 'available')
        : enriched
    if (typeFilter) {
      filtered = filtered.filter((h) => h.type === typeFilter)
    }

    // Ordena: com distância primeiro (mais próximo), sem distância no fim
    return [...filtered].sort((a, b) => {
      if (a._distance == null && b._distance == null) {
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      }
      if (a._distance == null) return 1
      if (b._distance == null) return -1
      return a._distance - b._distance
    })
  }, [enriched, filter, typeFilter])

  async function handleShareAll() {
    if (hgus.length === 0) return
    const r = await shareHgus(hgus, `${hgus.length} dispositivos compartilhados`)
    if (r.method === 'clipboard') {
      setShareMsg('Link copiado! Cole no WhatsApp para enviar.')
      setTimeout(() => setShareMsg(null), 3000)
    } else if (r.method === 'none') {
      setShareMsg('Não consegui compartilhar neste navegador.')
      setTimeout(() => setShareMsg(null), 3000)
    }
  }

  function handleExport() {
    if (hgus.length === 0) {
      setShareMsg('Nada para exportar — sem dispositivos cadastrados.')
      setTimeout(() => setShareMsg(null), 3000)
      return
    }
    const r = downloadBackup()
    setShareMsg(`Backup de ${r.count} dispositivo${r.count !== 1 ? 's' : ''} baixado. Guarde o arquivo em local seguro.`)
    setTimeout(() => setShareMsg(null), 5000)
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (e.target) e.target.value = ''
    if (!file) return
    const data = await readBackupFile(file)
    if (!data) {
      setShareMsg('Arquivo inválido. Selecione um backup .json gerado por este app.')
      setTimeout(() => setShareMsg(null), 4000)
      return
    }
    const ok = window.confirm(
      `Restaurar ${data.hgus.length} dispositivo(s) deste backup?\n\nDuplicados (mesmo SSID + Código) serão pulados.`
    )
    if (!ok) return
    const r = restoreBackup(data)
    setHgus(listHgus())
    const parts = [`${r.added} restaurado(s)`]
    if (r.skipped > 0) parts.push(`${r.skipped} duplicado(s) pulado(s)`)
    if (r.categoriesAdded > 0) parts.push(`${r.categoriesAdded} tipo(s) novo(s)`)
    setShareMsg(parts.join(' · '))
    setTimeout(() => setShareMsg(null), 5000)
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={onBack} className="btn-ghost" type="button">← Mapa</button>
          <h1 className="text-lg font-semibold flex-1 text-center">Dispositivos próximos</h1>
          <button
            onClick={handleShareAll}
            className="btn-ghost"
            type="button"
            disabled={hgus.length === 0}
            title="Compartilhar todos"
          >
            {'📤'}
          </button>
        </div>
        <div className="max-w-xl mx-auto px-4 pb-2 grid grid-cols-2 gap-2">
          <FilterButton
            active={filter === FILTERS.ALL}
            onClick={() => setFilter(FILTERS.ALL)}
            label={`Todos (${enriched.length})`}
          />
          <FilterButton
            active={filter === FILTERS.AVAILABLE}
            onClick={() => setFilter(FILTERS.AVAILABLE)}
            label={`Só disponíveis (${availableCount})`}
          />
        </div>
        {availableTypes.length > 0 && (
          <div className="max-w-xl mx-auto px-4 pb-3 flex items-center gap-2">
            <label className="text-slate-400 text-xs shrink-0">Tipo:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-base text-sm py-2 flex-1"
            >
              <option value="">Todos os tipos</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-2 pb-20">
        {shareMsg && (
          <div className="rounded-lg bg-emerald-950/70 border border-emerald-700 text-emerald-100 px-3 py-2 text-sm mb-2">
            {shareMsg}
          </div>
        )}
        {!userPosition && (
          <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 text-xs text-slate-400 mb-3">
            Sem GPS no momento — distâncias indisponíveis.
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {filter === FILTERS.AVAILABLE
              ? 'Nenhum dispositivo disponível agora.'
              : 'Nenhum dispositivo cadastrado ainda.'}
          </div>
        ) : (
          items.map((hgu) => {
            const color = statusColor(hgu._availability.status)
            return (
              <button
                key={hgu.id}
                type="button"
                onClick={() => onSelectHgu?.(hgu)}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-800 rounded-lg p-3 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0 leading-none" style={{ color }}>●</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{hgu.ssid}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {hgu.type ? `${hgu.type} · ` : ''}
                      {statusLabel(hgu._availability.status)}
                      {hgu.address ? ` · ${hgu.address}` : ''}
                    </div>
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <div className="text-slate-300 font-medium">
                      {formatDistance(hgu._distance)}
                    </div>
                    {!hgu.location && (
                      <div className="text-slate-500 text-xs">sem GPS</div>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}

        {isFSASupported() && (
          <div className="pt-6 space-y-2 border-t border-slate-800/60 mt-4">
            <p className="text-slate-400 text-xs text-center pt-2">Backup automático</p>
            {autoOn ? (
              <>
                <div className="text-center text-emerald-400 text-sm">
                  ✓ Ativo · sincronizado {formatAgo(autoStatus.lastSync)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={handleManualSync} className="btn-secondary text-sm">
                    Sincronizar agora
                  </button>
                  <button type="button" onClick={handleDisableAuto} className="btn-secondary text-sm">
                    Desativar
                  </button>
                </div>
              </>
            ) : (
              <>
                <button type="button" onClick={handleEnableAuto} className="btn-primary text-sm">
                  Ativar backup automático
                </button>
                <p className="text-slate-500 text-xs text-center">
                  Você escolhe o arquivo uma vez; o app atualiza ele sozinho a cada mudança.
                </p>
              </>
            )}
          </div>
        )}

        <div className="pt-6 space-y-2 border-t border-slate-800/60 mt-4">
          <p className="text-slate-400 text-xs text-center pt-2">Backup manual (arquivo .json)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={hgus.length === 0}
              className="btn-secondary text-sm"
            >
              {'💾'} Exportar
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              {'📂'} Importar
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        <div className="pt-4 text-center">
          <CreditLink size="small" />
        </div>
      </main>
    </div>
  )
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}
