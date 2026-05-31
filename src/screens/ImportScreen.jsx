import { useState } from 'react'
import { importHgus } from '../utils/storage.js'
import { CreditLink } from '../components/CreditLink.jsx'

/**
 * Tela mostrada quando o app abre com HGUs recebidos via link (#import=...).
 * Lista o que chegou e deixa o usuário salvar ou descartar.
 */
export function ImportScreen({ incoming, onDone }) {
  const [result, setResult] = useState(null)

  const items = Array.isArray(incoming) ? incoming : []

  function handleSave() {
    const r = importHgus(items)
    setResult(r)
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-center">HGUs recebidos</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-24">
        {result ? (
          <>
            <div className="rounded-lg bg-emerald-950/70 border border-emerald-700 text-emerald-100 px-4 py-3">
              <div className="font-semibold">Pronto!</div>
              <div className="text-sm mt-1">
                {result.added} HGU{result.added !== 1 ? 's' : ''} salvo{result.added !== 1 ? 's' : ''}.
                {result.skipped > 0 && ` ${result.skipped} já existia${result.skipped !== 1 ? 'm' : ''} (pulado${result.skipped !== 1 ? 's' : ''}).`}
              </div>
            </div>
            <button onClick={onDone} className="btn-primary">Ver no mapa</button>
          </>
        ) : items.length === 0 ? (
          <>
            <div className="rounded-lg bg-red-950/60 border border-red-800 text-red-200 px-4 py-3 text-sm">
              O link de compartilhamento parece inválido ou está incompleto.
            </div>
            <button onClick={onDone} className="btn-secondary">Voltar</button>
          </>
        ) : (
          <>
            <p className="text-slate-300 text-sm">
              Você recebeu {items.length} HGU{items.length !== 1 ? 's' : ''}. Confira e salve no seu app.
              <span className="text-slate-500"> (As fotos não vêm no compartilhamento.)</span>
            </p>

            <div className="space-y-2">
              {items.map((h, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="font-semibold">{h.ssid || '(sem SSID)'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {h.type ? `${h.type} · ` : ''}SLID: {h.slid || '—'}
                    {h.address ? ` · ${h.address}` : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <button onClick={handleSave} className="btn-primary">
                Salvar {items.length > 1 ? 'todos' : ''}
              </button>
              <button onClick={onDone} className="btn-secondary">Descartar</button>
            </div>
          </>
        )}
              <div className="pt-6 text-center">
          <CreditLink size="small" />
        </div>
      </main>
    </div>
  )
}
