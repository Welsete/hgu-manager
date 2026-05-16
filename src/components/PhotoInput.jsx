import { useRef } from 'react'
import { compressImage } from '../utils/image.js'

/**
 * Input de foto opcional com captura direta da câmera traseira no mobile.
 * Recebe e devolve um data URL (string base64) — ou null para limpar.
 */
export function PhotoInput({ value, onChange, disabled }) {
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      onChange(dataUrl)
    } catch (err) {
      console.error('Erro ao processar imagem:', err)
      alert('Não consegui processar essa imagem. Tente outra.')
    } finally {
      // Permite re-selecionar o mesmo arquivo
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="label-base">Foto do HGU (opcional)</label>

      {value ? (
        <div className="space-y-2">
          <img
            src={value}
            alt="Foto do HGU"
            className="w-full max-h-64 object-cover rounded-lg border border-slate-700"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn-secondary"
            disabled={disabled}
          >
            Remover foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-secondary"
          disabled={disabled}
        >
          Tirar foto / Escolher imagem
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
