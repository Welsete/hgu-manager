// Registro do service worker com check de update periódico e ao voltar foco.
// vite-plugin-pwa expõe `virtual:pwa-register` que devolve a função `registerSW`.
import { registerSW } from 'virtual:pwa-register'

const UPDATE_INTERVAL_MS = 60_000 // checa a cada 60s

export function registerPwa() {
  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      // Check de update periódico (só se online)
      setInterval(() => {
        if (navigator.onLine) {
          registration.update().catch(() => {})
        }
      }, UPDATE_INTERVAL_MS)

      // Check ao voltar pra aba/app (usuário trocou de app e voltou)
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          registration.update().catch(() => {})
        }
      })
    },
    onNeedRefresh() {
      // Com skipWaiting+clientsClaim, o SW novo já assume sozinho.
      // Aqui só forçamos um reload pra garantir que o HTML/JS em memória também atualize.
      // Pequeno delay pra não interromper se o usuário estiver no meio de uma ação.
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          updateSW(true) // true = recarregar
        }
      }, 1500)
    }
  })
}
