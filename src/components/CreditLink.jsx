/**
 * Crédito do desenvolvedor. Variante `large` é mais visível (usada no Mapa),
 * a `small` aparece discreta nas outras telas.
 */
export function CreditLink({ size = 'small' }) {
  const base =
    'inline-flex items-center gap-1 transition hover:text-emerald-400 hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]'
  const cls =
    size === 'large'
      ? `${base} text-slate-400 text-xs`
      : `${base} text-slate-600 text-[10px]`
  return (
    <a
      href="https://github.com/welsete"
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
    >
      by Wellerson Tavares ↗
    </a>
  )
}
