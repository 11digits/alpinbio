import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import './assets/main.css'
import 'sweetalert2/dist/sweetalert2.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)

router.beforeEach((to) => {
  if (to.name !== 'login' && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

app.use(router)

app.mount('#app')

import Swal from 'sweetalert2'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    async onNeedRefresh() {
      const result = await Swal.fire({
        title: 'Actualizare disponibilă',
        text: 'Există o versiune nouă. Reîncarci pentru a actualiza?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Da, reîncarcă',
        cancelButtonText: 'Nu',
      })

      if (result.isConfirmed) {
        updateSW(true)
      }
    },
    onRegisteredSW(swUrl) {
      console.info('Service Worker registered:', swUrl)
    },
    onRegisterError(error) {
      console.error('Service Worker registration failed:', error)
    }
  })
}
