<template>
  <div class="min-h-dvh flex flex-col items-center justify-center px-6 bg-white overflow-hidden">
    <img
      src="/ttclogo500.png"
      alt="TotalClean Track Logo"
      class="w-32 h-32 mb-2"
    />

    <h1 class="text-2xl font-bold mb-6 text-blue-600">{{ t('common.appName') }} <small>(v{{ appVersion }})</small></h1>

    <p class="mb-6 text-gray-700">{{ t('login.subtitle') }}</p>

    <div class="grid grid-cols-4 gap-4 mb-10">
      <div
        v-for="n in 4"
        :key="n"
        class="w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition"
        :class="pin.length === n ? 'border-blue-500' : 'border-gray-300'"
      >
        {{ pin[n - 1] || '' }}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-6 w-full max-w-xs">
      <button
        v-for="n in 9"
        :key="n"
        class="h-14 bg-white border border-gray-300 rounded-lg text-xl shadow-sm active:bg-gray-100"
        @click="addDigit(n)"
      >
        {{ n }}
      </button>

      <button
        class="h-14 bg-white border border-gray-300 rounded-lg text-xl shadow-sm text-red-500 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="backspace"
        :aria-label="t('common.buttons.back')"
        :disabled="pin.length === 0"
      >
        ⌫
      </button>

      <button
        class="h-14 bg-white border border-gray-300 rounded-lg text-xl shadow-sm active:bg-gray-100"
        @click="addDigit('0')"
      >
        0
      </button>

      <button
        class="h-14 col-span-1 bg-blue-500 text-white rounded-lg text-lg font-semibold disabled:opacity-50 disabled:bg-blue-300"
        :disabled="pin.length !== 4"
        @click="login"
      >
        ✔
      </button>
    </div>

    <div class="w-full max-w-xs flex flex-col items-center">
      <label for="login-language" class="sr-only">{{ t('topbar.languageSelectorLabel') }}</label>
      <select
        id="login-language"
        v-model="locale"
        class="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :aria-label="t('topbar.languageSelectorLabel')"
      >
        <option
          v-for="lang in languages"
          :key="lang.value"
          :value="lang.value"
        >
          {{ t(lang.labelKey) }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })
const pin = ref([])
const { proxy } = getCurrentInstance()

const appVersion = __APP_VERSION__

const languages = [
  { value: 'en', labelKey: 'common.languages.en' },
  { value: 'ro', labelKey: 'common.languages.ro' },
  { value: 'hu', labelKey: 'common.languages.hu' },
  { value: 'pk', labelKey: 'common.languages.pk' },
  { value: 'np', labelKey: 'common.languages.np' },
  { value: 'fr', labelKey: 'common.languages.fr' },
  { value: 'uk', labelKey: 'common.languages.uk' },
]

function addDigit(digit) {
  if (pin.value.length < 4) {
    pin.value.push(digit)
  }
}

function backspace() {
  pin.value.pop()
}

async function login() {
  if (pin.value.length === 4) {
    const entered = pin.value.join('')

    try {
      proxy.$loader.show();
      const res = await proxy.$axios.post('/login', { pin: entered, language: locale.value })

      if (res.data.status) {
        auth.setAuth(res.data.token, res.data.pin, res.data.data)

        proxy.$swal.fire({
          toast: true,
          position: 'center',
          icon: 'success',
          title: t('login.successTitle'),
          text: res.data.data.operator.nume_prenume,
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          router.push('/home')
        })
      } else {
        proxy.$swal.fire({
          icon: 'error',
          title: t('login.invalidPinTitle'),
          text: t('login.invalidPinText'),
          confirmButtonColor: '#2563eb'
        })
        pin.value = []
      }
    } catch (err) {
      console.error('Login failed:', err)
      proxy.$swal.fire({
        icon: 'error',
        title: t('login.errorTitle'),
        text: t('login.errorText'),
        confirmButtonColor: '#2563eb'
      })
      pin.value = []
    } finally {
      proxy.$loader.hide()
    }
  }
}
</script>
