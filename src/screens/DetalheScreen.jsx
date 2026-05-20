import { useState } from 'react'
import { deleteHgu, registerMagicToolUse, updateHgu } from '../utils/storage.js'
import { getAvailability, statusColor, statusLabel } from '../utils/availability.js'
import { NavigateButton } from '../components/NavigateButton.jsx'

export function DetalheScreen({ hgu: hguProp, onBack, onDeleted, onShowOnMap, onEdit }) {
  // Estado local pra atualizar a UI na hora ao registrar/limpar uso
  const [hgu, setHgu] = useState(hguProp)
  const [showPasswords, setShowPasswords] = useState(false)
  const [flash, setFlash] = useState(null) // mensagem de feedback temporária

  if (!hgu) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">HGU não encontrado.</p>
          <button onClick={onBack} className="btn-secondary">Voltar ao mapa</button>
        </div>
      </div>
    )
  }

  const { status, daysSinceUse, daysUntilAvailable } = getAvailability(hgu)
  const color = statusColor(status)

  function showFlash(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 3000)
  }

  function handleUseMagicTool() {
    let message =
      'Confirmar uso do Magic Tool agora?\n\nIsso vai bloquear esse HGU por 7 dias.'
    if (status !== 'available') {
      const faltam = Math.ceil(daysUntilAvailable)
      message =
        `⚠️ ATENÇÃO: esse HGU foi usado recentemente e ainda faltam ${faltam} dia${faltam !== 1 ? 's' : ''} para liberar.\n\n` +
        'Usar mesmo assim vai REINICIAR o bloqueio de 7 dias a partir de agora.\n\nTem certeza?'
    }
    if (!window.confirm(message)) return
    const updated = registerMagicToolUse(hgu.id)
    if (updated) {
      setHgu(updated)
      showFlash('Uso do Magic Tool registrado. HGU bloqueado por 7 dias.')
    }
  }

  function handleClearUse() {
    const ok = window.confirm(
      'Limpar o último uso registrado?\n\nO HGU vai voltar a ficar disponível. Use isso só se registrou por engano.'
    )
    if (!ok) return
    const updated = updateHgu(hgu.id, { lastMagicToolUse: null })
    if (updated) {
      setHgu(updated)
      showFlash('Último uso limpo. HGU disponível novamente.')
    }
  }

  function handleDelete() {
    const ok = window.confirm(`Apagar o HGU "${hgu.ssid}"?\n\nEsta ação não pode ser desfeita.`)
    if (!ok) return
    deleteHgu(hgu.id)
    onDeleted?.()
  }

  function handleDownloadPhoto() {
    if (!hgu.photo) return
    const safe = (s) => (s || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
    const filename = `HGU_${safe(hgu.ssid)}_${safe(hgu.slid)}.jpg`
    const a = document.createElement('a')
    a.href = hgu.photo
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={onBack} className="btn-ghost" type="button">&larr; Voltar</button>
          <h1 className="text-lg font-semibold flex-1 text-center truncate">
            {hgu.ssid}
          </h1>
          <button onClick={() => onEdit?.(hgu)} className="btn-ghost" type="button">
            {'✏️'} Editar
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-24">
        {/* Card de status */}
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: color, backgroundColor: color + '1a' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none" style={{ color }}>&#9679;</span>
            <div>
              <div className="font-bold text-lg" style={{ color }}>
                {statusLabel(status)}
              </div>
              <div className="text-sm text-slate-300">
                {daysSinceUse == null
                  ? 'Nunca usado para Magic Tool'
                  : status === 'available'
                  ? `Último uso há ${Math.floor(daysSinceUse)} dia${Math.floor(daysSinceUse) !== 1 ? 's' : ''}`
                  : `Libera em ${Math.ceil(daysUntilAvailable)} dia${Math.ceil(daysUntilAvailable) !== 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
        </div>

        {/* Card de último uso (sempre visível) */}
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
            Último uso do Magic Tool
          </div>
          {hgu.lastMagicToolUse ? (
            <>
              <div className="text-slate-100 font-semibold text-lg">
                {new Date(hgu.lastMagicToolUse).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>
              <div className="text-slate-400 text-sm mt-0.5">
                há {Math.floor(daysSinceUse)} dia{Math.floor(daysSinceUse) !== 1 ? 's' : ''}
              </div>
            </>
          ) : (
            <div className="text-slate-100 font-semibold text-lg">
              Nunca usado
            </div>
          )}
        </div>

        {/* Mensagem de feedback */}
        {flash && (
          <div className="rounded-lg bg-emerald-950/70 border border-emerald-700 text-emerald-200 px-3 py-2 text-sm">
            {flash}
          </div>
        )}

        {/* AÇÃO PRINCIPAL: Usar Magic Tool agora */}
        <button
          type="button"
          onClick={handleUseMagicTool}
          className={
            status === 'available'
              ? 'btn-primary text-lg'
              : 'w-full rounded-lg bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white font-semibold py-3 px-4 text-lg transition'
          }
        >
          {status === 'available'
            ? '✓ Usar Magic Tool agora'
            : '⚠️ Usar Magic Tool mesmo assim'}
        </button>

        {/* Foto + botão de download */}
        {hgu.photo && (
          <div className="space-y-2">
            <img
              src={hgu.photo}
              alt={`Foto de ${hgu.ssid}`}
              className="w-full max-h-72 object-cover rounded-lg border border-slate-700"
            />
            <button
              type="button"
              onClick={handleDownloadPhoto}
              className="btn-secondary"
            >
              {'📥'} Baixar foto (para o Zeus)
            </button>
          </div>
        )}

        {/* Ações de localização (só se tem GPS) */}
        {hgu.location && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onShowOnMap?.(hgu)}
              className="btn-secondary"
            >
              {'🗺️'} Mostrar no mapa
            </button>
            <NavigateButton location={hgu.location} />
          </div>
        )}

        {/* Dados */}
        <div className="space-y-4">
          <Field label="SSID" value={hgu.ssid} />
          <Field label="Senha WiFi" value={hgu.wifiPassword} secret revealed={showPasswords} copyable />
          <Field label="Senha do modem" value={hgu.modemPassword} secret revealed={showPasswords} copyable />
          <Field label="SLID" value={hgu.slid} copyable />
          {hgu.address && <Field label="Endereço" value={hgu.address} copyable />}
          {hgu.note && <Field label="Anotação" value={hgu.note} />}
          {hgu.location ? (
            <Field
              label="GPS"
              value={`${hgu.location.lat.toFixed(6)}, ${hgu.location.lng.toFixed(6)}`}
              hint={hgu.location.accuracy ? `Precisão ±${Math.round(hgu.location.accuracy)} m` : null}
              copyable
            />
          ) : (
            <Field label="GPS" value="Não cadastrado" hint="Não vai aparecer no mapa." />
          )}
          <Field
            label="Cadastrado em"
            value={new Date(hgu.createdAt).toLocaleString('pt-BR')}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords((s) => !s)}
          className="btn-secondary"
        >
          {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
        </button>

        {/* Ações secundárias */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          {hgu.lastMagicToolUse && (
            <button
              type="button"
              onClick={handleClearUse}
              className="btn-secondary text-sm"
            >
              {'↺'} Corrigir último uso (registrei por engano)
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-lg bg-red-950 hover:bg-red-900 active:bg-red-950 text-red-200 font-semibold py-3 px-4 transition border border-red-800"
          >
            Apagar HGU
          </button>
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, secret, revealed, hint, copyable }) {
  const [copied, setCopied] = useState(false)
  const display = secret && !revealed ? '**********' : value

  function handleCopy() {
    const text = String(value ?? '')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }).catch(() => {})
    } else {
      // Fallback pra navegadores antigos / contexto não-seguro
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* noop */ }
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div>
      <div className="text-slate-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="flex items-center gap-2 mt-0.5">
        <div className="text-slate-100 font-mono break-all flex-1">{display}</div>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        )}
      </div>
      {hint && <div className="text-slate-500 text-xs mt-0.5">{hint}</div>}
    </div>
  )
}
