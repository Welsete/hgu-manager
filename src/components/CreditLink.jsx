/**
 * Crédito do desenvolvedor + link pros Termos de Uso.
 * 'large' aparece em destaque no Mapa; 'small' nas demais telas.
 */
export function CreditLink({ size = 'small' }) {
  const base =
    'inline-flex items-center gap-1 transition hover:text-emerald-400'
  const cls =
    size === 'large'
      ? `${base} text-slate-400 text-xs`
      : `${base} text-slate-600 text-[10px]`

  function showTerms() {
    window.dispatchEvent(new CustomEvent('show-terms'))
  }

  return (
    <div className={`flex items-center gap-3 ${size === 'large' ? '' : 'justify-center'}`}>
      <a
        href="https://github.com/welsete"
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        by Wellerson Tavares ↗
      </a>
      <span className={size === 'large' ? 'text-slate-700 text-xs' : 'text-slate-800 text-[10px]'}>·</span>
      <button
        type="button"
        onClick={showTerms}
        className={cls}
      >
        Termos
      </button>
    </div>
  )
}
