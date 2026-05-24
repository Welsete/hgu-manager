/**
 * Home placeholder do Módulo 1.
 * Nos próximos módulos vai virar o Mapa (Módulo 2) com botão flutuante de cadastro.
 */
export function HomeScreen({ count, onNewHgu, lastSaved }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900/95 border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-emerald-400">●</span>
            HGU Manager
          </h1>
          <p className="text-slate-400 text-sm">
            Catálogo de HGUs e gerenciador do Magic Tool
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="text-slate-400 text-sm">HGUs cadastrados</div>
          <div className="text-4xl font-bold mt-1">{count}</div>
        </div>

        {lastSaved && (
          <div className="rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 px-4 py-3 text-sm">
            <strong>{lastSaved.ssid}</strong> cadastrado com sucesso.
          </div>
        )}

        <button onClick={onNewHgu} className="btn-primary text-lg">
          + Cadastrar novo HGU
        </button>

        <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-4 text-sm text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300">Próximos módulos:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Mapa com pinos coloridos (Módulo 2)</li>
            <li>Botão "Usar Magic Tool agora" + regra dos 15 dias (Módulo 3)</li>
            <li>Lista, busca e refinamentos (Módulo 4)</li>
          </ul>
        </div>
      </main>

      <footer className="text-center text-slate-600 text-xs py-4">
        v0.1 — Módulo 1 (Cadastro)
      </footer>
    </div>
  )
}
