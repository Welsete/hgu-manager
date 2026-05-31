// Aceite dos termos de uso. Guarda no localStorage pra mostrar só uma vez.

const TERMS_KEY = 'well-hgu:terms-accepted:v1'

export function isTermsAccepted() {
  try {
    return localStorage.getItem(TERMS_KEY) === '1'
  } catch {
    return false
  }
}

export function acceptTerms() {
  try {
    localStorage.setItem(TERMS_KEY, '1')
  } catch {
    // ignora
  }
}
