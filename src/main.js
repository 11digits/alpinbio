import { createApp, watch } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { createPinia } from 'pinia'
import { useZoneSessionsStore } from '@/stores/zoneSessions'

import i18n, { LOCALE_STORAGE_KEY } from './plugins/i18n'
import SwalPlugin from './plugins/swal'
import AxiosPlugin from './plugins/axios'
import GeolocationPlugin from './plugins/geolocation'
import LoaderPlugin from './plugins/loader'

import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(SwalPlugin)
app.use(AxiosPlugin)
app.use(GeolocationPlugin)
app.use(LoaderPlugin)

const zoneSessions = useZoneSessionsStore(pinia)
zoneSessions.initialize()

watch(
  () => i18n.global.locale.value,
  (newLocale) => {
    const rtlLocales = ['pk']
    document.documentElement.setAttribute('dir', rtlLocales.includes(newLocale) ? 'rtl' : 'ltr')

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
      } catch (error) {
        console.warn('[i18n] Failed to persist locale', error)
      }
    }
  },
  { immediate: true }
)

const { t } = i18n.global
const swal = app.config.globalProperties.$swal

const updateSW = registerSW({
  onNeedRefresh() {
    swal.fire({
      title: t('common.pwa.update.title'),
      text: t('common.pwa.update.text'),
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('common.pwa.update.confirm'),
      cancelButtonText: t('common.pwa.update.cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        updateSW(true)
      }
    })
  },
  onOfflineReady() {
    swal.fire({
      toast: true,
      position: 'top',
      icon: 'success',
      title: t('common.pwa.offlineReady'),
      showConfirmButton: false,
      timer: 3000
    })
  }
})

app.mount('#app')
