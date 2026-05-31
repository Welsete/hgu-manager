// Regra dos 15 dias para reuso da Validação no mesmo dispositivo.
//
// 🟢 Disponível      → nunca usado OU último uso há >= 15 dias
// 🟡 Quase liberando → faltam até 2 dias para completar 15 (ou seja, 13 a 15 dias)
// 🔴 Bloqueado       → último uso há menos de 13 dias

export const STATUS = {
  AVAILABLE: 'available',
  WARNING: 'warning',
  BLOCKED: 'blocked'
}

// Ciclo de reuso e janela do aviso "quase liberando".
// Centralizado aqui pra facilitar mudar a regra no futuro.
export const CYCLE_DAYS = 15
const WARNING_WINDOW_DAYS = 2

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Calcula a disponibilidade do dispositivo no momento `now`.
 * @param {object} hgu
 * @param {number} [now] - timestamp ms (default: Date.now())
 * @returns {{ status: string, daysSinceUse: number|null, daysUntilAvailable: number }}
 */
export function getAvailability(hgu, now = Date.now()) {
  if (!hgu?.lastMagicToolUse) {
    return { status: STATUS.AVAILABLE, daysSinceUse: null, daysUntilAvailable: 0 }
  }
  const lastUse = new Date(hgu.lastMagicToolUse).getTime()
  if (Number.isNaN(lastUse)) {
    return { status: STATUS.AVAILABLE, daysSinceUse: null, daysUntilAvailable: 0 }
  }

  const days = (now - lastUse) / MS_PER_DAY

  if (days >= CYCLE_DAYS) {
    return { status: STATUS.AVAILABLE, daysSinceUse: days, daysUntilAvailable: 0 }
  }
  if (days >= CYCLE_DAYS - WARNING_WINDOW_DAYS) {
    return { status: STATUS.WARNING, daysSinceUse: days, daysUntilAvailable: CYCLE_DAYS - days }
  }
  return { status: STATUS.BLOCKED, daysSinceUse: days, daysUntilAvailable: CYCLE_DAYS - days }
}

export function statusLabel(status) {
  switch (status) {
    case STATUS.AVAILABLE: return 'Disponível'
    case STATUS.WARNING: return 'Quase liberando'
    case STATUS.BLOCKED: return 'Bloqueado'
    default: return 'Desconhecido'
  }
}

export function statusColor(status) {
  switch (status) {
    case STATUS.AVAILABLE: return '#22c55e' // verde
    case STATUS.WARNING:   return '#eab308' // amarelo
    case STATUS.BLOCKED:   return '#ef4444' // vermelho
    default: return '#94a3b8'
  }
}
