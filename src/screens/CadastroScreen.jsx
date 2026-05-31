import { useState } from 'react'
import { TextField } from '../components/TextField.jsx'
import { PhotoInput } from '../components/PhotoInput.jsx'
import { GpsField } from '../components/GpsField.jsx'
import { AddressField } from '../components/AddressField.jsx'
import { TypeSelector } from '../components/TypeSelector.jsx'
import { createHgu, updateHgu } from '../utils/storage.js'
import { CreditLink } from '../components/CreditLink.jsx'

const EMPTY_FORM = {
  ssid: '',
  type: '',
  wifiPassword: '',
  modemPassword: '',
  slid: '',
  note: '',
  address: '',
  photo: null,
  location: null
}

function formFromHgu(hgu) {
  return {
    ssid: hgu.ssid || '',
    type: hgu.type || '',
    wifiPassword: hgu.wifiPassword || '',
    modemPassword: hgu.modemPassword || '',
    slid: hgu.slid || '',
    note: hgu.note || '',
    address: hgu.address || '',
    photo: hgu.photo || null,
    location: hgu.location || null
  }
}

export function CadastroScreen({ onBack, onSaved, editingHgu, userPosition }) {
  const isEditing = !!editingHgu
  const [form, setForm] = useState(editingHgu ? formFromHgu(editingHgu) : EMPTY_FORM)
  const [showPasswords, setShowPasswords] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  function validate() {
    const next = {}
    if (!form.ssid.trim()) next.ssid = 'Informe o SSID'
    if (!form.wifiPassword.trim()) next.wifiPassword = 'Informe a senha do WiFi'
    if (!form.modemPassword.trim()) next.modemPassword = 'Informe a senha do modem'
    if (!form.slid.trim()) next.slid = 'Informe o SLID'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      if (isEditing) {
        const updated = updateHgu(editingHgu.id, {
          ssid: form.ssid.trim(),
          type: form.type.trim(),
          wifiPassword: form.wifiPassword.trim(),
          modemPassword: form.modemPassword.trim(),
          slid: form.slid.trim(),
          note: form.note.trim(),
          address: form.address.trim(),
          photo: form.photo,
          location: form.location
        })
        onSaved?.(updated)
      } else {
        const hgu = createHgu(form)
        setForm(EMPTY_FORM)
        onSaved?.(hgu)
      }
    } catch (err) {
      setSubmitError(err.message || 'Erro ao salvar HGU.')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePwIcon = (
    <button
      type="button"
      onClick={() => setShowPasswords((s) => !s)}
      className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1"
      tabIndex={-1}
    >
      {showPasswords ? 'Ocultar' : 'Mostrar'}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={onBack} className="btn-ghost" type="button">&larr; Voltar</button>
          <h1 className="text-lg font-semibold flex-1 text-center pr-16">
            {isEditing ? 'Editar HGU' : 'Cadastrar HGU'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-24">
        <TextField
          label="SSID (nome da rede WiFi)"
          value={form.ssid}
          onChange={(v) => update('ssid', v)}
          placeholder="Ex: VIVO-FIBRA-A1B2"
          required
          error={errors.ssid}
        />

        <TypeSelector
          value={form.type}
          onChange={(v) => update('type', v)}
        />

        <TextField
          label="Senha do WiFi"
          type={showPasswords ? 'text' : 'password'}
          value={form.wifiPassword}
          onChange={(v) => update('wifiPassword', v)}
          required
          error={errors.wifiPassword}
          rightSlot={togglePwIcon}
          autoComplete="new-password"
        />

        <TextField
          label="Senha do modem (painel admin)"
          type={showPasswords ? 'text' : 'password'}
          value={form.modemPassword}
          onChange={(v) => update('modemPassword', v)}
          hint="Acessada em 192.168.15.1 ou similar"
          required
          error={errors.modemPassword}
          rightSlot={togglePwIcon}
          autoComplete="new-password"
        />

        <TextField
          label="SLID (serial do equipamento)"
          value={form.slid}
          onChange={(v) => update('slid', v)}
          placeholder="Ex: ALCL12345678"
          required
          error={errors.slid}
          inputMode="text"
        />

        <TextField
          label="Anotação (opcional)"
          value={form.note}
          onChange={(v) => update('note', v)}
          placeholder="Ex: cliente do 3º andar, fundos"
        />

        <GpsField
          value={form.location}
          onChange={(v) => update('location', v)}
          disabled={submitting}
          userPosition={userPosition}
        />

        <AddressField
          value={form.address}
          onChange={(v) => update('address', v)}
          location={form.location}
          onLocationFromAddress={(loc) => update('location', loc)}
        />

        <PhotoInput
          value={form.photo}
          onChange={(v) => update('photo', v)}
          disabled={submitting}
        />

        {submitError && (
          <div className="rounded-lg bg-red-950/60 border border-red-800 text-red-200 px-3 py-2 text-sm">
            {submitError}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Salvar HGU'}
        </button>

        <p className="text-center text-slate-500 text-xs">
          Os dados são salvos localmente neste celular.
        </p>

        <div className="pt-4 text-center">
          <CreditLink size="small" />
        </div>
      </form>
    </div>
  )
}
