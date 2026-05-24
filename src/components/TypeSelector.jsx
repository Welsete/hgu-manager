import { useEffect, useState } from 'react'
import { listCategories, addCategory } from '../utils/storage.js'

/**
 * Seletor do tipo de HGU (HGU 5, HGU 6, HGU com telefone, etc.).
 * As categorias ficam salvas no localStorage e o usuário pode adicionar novas na hora.
 */
export function TypeSelector({ value, onChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    setCategories(listCategories())
  }, [])

  function handleAdd() {
    const name = window.prompt('Nome do novo tipo de HGU (ex: HGU 6, HGU com telefone):')
    if (!name || !name.trim()) return
    const updated = addCategory(name)
    setCategories(updated)
    onChange(name.trim())
  }

  // Garante que o valor atual sempre apareça como opção (mesmo se a categoria foi removida)
  const options =
    value && !categories.some((c) => c === value) ? [value, ...categories] : categories

  return (
    <div>
      <label className="label-base">Tipo de HGU</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="input-base text-slate-100"
      >
        <option value="">— Selecione o tipo —</option>
        {options.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAdd}
        className="btn-secondary text-sm mt-2"
      >
        + Adicionar novo tipo
      </button>
    </div>
  )
}
