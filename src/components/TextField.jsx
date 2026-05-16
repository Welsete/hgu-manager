/**
 * Input de texto reutilizável com label, hint e estado de erro.
 */
export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  required,
  error,
  autoComplete = 'off',
  inputMode,
  rightSlot
}) {
  return (
    <div>
      <label className="label-base">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`input-base ${error ? 'border-red-500 focus:ring-red-500' : ''} ${rightSlot ? 'pr-12' : ''}`}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightSlot}
          </div>
        )}
      </div>
      {hint && !error && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
