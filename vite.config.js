import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

import { version } from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Alpin Bio Solution Payments',
        short_name: 'Alpin Bio',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#059669',
        icons: [
          {
            src: '/alpin-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/alpin-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          }
        ]
      }
    }),
    //vueDevTools()
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    chunkSizeWarningLimit: 2500, // in kB
  },
  base: '/'
})
