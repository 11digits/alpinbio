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
        name: 'TotalClean Track app',
        short_name: 'TTC Track',
        start_url: '/ttctrack',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/ttctrack/ttclogo500.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ttctrack/ttclogo500.png',
            sizes: '512x512',
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
  base: '/ttctrack/'
})
