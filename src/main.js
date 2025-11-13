import { createApp } from 'vue'
import { createPinia } from 'pinia'
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
