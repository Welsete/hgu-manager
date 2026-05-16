import { useRef } from 'react'
import { compressImage } from '../utils/image.js'

/**
 * Input de foto opcional. Permite escolher entre câmera traseira (capture=environment)
 * ou galeria (file picker padrão). Devolve um data URL ou null.
 */
export function PhotoInput({ value, onChange, disabled }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

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
      if (e.target) e.target.value = ''
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
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="btn-secondary"
            disabled={disabled}
          >
            📷 Câmera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="btn-secondary"
            disabled={disabled}
          >
            🖼️ Galeria
          </button>
        </div>
      )}

      {/* Câmera traseira direto */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {/* Galeria / file picker padrão */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
