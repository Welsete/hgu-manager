import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// HGU Manager — PWA local-first, sem backend
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'HGU Manager',
        short_name: 'HGU Manager',
        description: 'Catálogo de HGUs e gerenciador de disponibilidade do Magic Tool',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        // skipWaiting + clientsClaim = o novo service worker assume IMEDIATAMENTE
        // quando o usuário recarregar, sem precisar fechar todas as abas / limpar cache.
        skipWaiting: true,
        clientsClaim: true,
        // SPA: qualquer rota desconhecida cai no index.html
        navigateFallback: '/index.html'
      }
    })
  ]
})
