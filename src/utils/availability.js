// Regra dos 7 dias para uso do Magic Tool no mesmo HGU.
//
// 🟢 Disponível    → nunca usado OU último uso há >= 7 dias
// 🟡 Quase liberando → último uso entre 5 e 7 dias
// 🔴 Bloqueado     → último uso há < 5 dias

export const STATUS = {
  AVAILABLE: 'available',
  WARNING: 'warning',
  BLOCKED: 'blocked'
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Calcula a disponibilidade do HGU no momento `now`.
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

  if (days >= 7) {
    return { status: STATUS.AVAILABLE, daysSinceUse: days, daysUntilAvailable: 0 }
  }
  if (days >= 5) {
    return { status: STATUS.WARNING, daysSinceUse: days, daysUntilAvailable: 7 - days }
  }
  return { status: STATUS.BLOCKED, daysSinceUse: days, daysUntilAvailable: 7 - days }
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
