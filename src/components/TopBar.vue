<template>
  <header
    v-if="show"
    class="fixed top-0 left-0 right-0 backdrop-blur-md bg-white/80 border-b border-gray-200 h-12 flex items-center justify-center px-4 z-50"
  >
    <div class="absolute left-4 flex items-center">
      <button
        v-if="showBack"
        @click="goBack"
        class="p-0 m-0 bg-transparent border-none outline-none text-gray-900 active:opacity-70 transition"
        :aria-label="t('common.buttons.back')"
      >
        <ChevronLeftIcon class="w-6 h-6" />
      </button>
      <div v-else-if="isHome" class="flex items-center">
        <select
          v-model="locale"
          class="text-sm font-medium text-gray-900 bg-white/80 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

    <h1 class="text-base font-semibold text-gray-900">
      {{ title }}
    </h1>

    <button
      v-if="isHome"
      @click="logout"
      class="absolute right-4 p-0 m-0 bg-transparent border-none outline-none text-red-600 active:opacity-70 transition"
      :aria-label="t('common.buttons.logout')"
    >
      <ArrowRightOnRectangleIcon class="w-6 h-6" />
    </button>
  </header>
</template>


<script setup>
import { computed, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useZoneSessionsStore } from '@/stores/zoneSessions'
import { getLocalizedZoneName } from '@/utils/operations'

const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()
const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const zoneSessions = useZoneSessionsStore()

const languages = [
  { value: 'en', labelKey: 'common.languages.en' },
  { value: 'ro', labelKey: 'common.languages.ro' },
  { value: 'hu', labelKey: 'common.languages.hu' },
  { value: 'pk', labelKey: 'common.languages.pk' },
  { value: 'np', labelKey: 'common.languages.np' },
  { value: 'fr', labelKey: 'common.languages.fr' },
  { value: 'uk', labelKey: 'common.languages.uk' },
]

const hiddenRouteNames = ['login']
const routeName = computed(() => route.name)
const show = computed(() => !hiddenRouteNames.includes(routeName.value))
const showBack = computed(() => routeName.value !== 'home')
const isHome = computed(() => routeName.value === 'home')

const zoneTitle = computed(() => {
  if (routeName.value !== 'zone') {
    return ''
  }

  const zoneId = route.params.id
  if (!zoneId) {
    return ''
  }

  for (const contract of auth.data?.contracts || []) {
    const zone = contract.zones?.find((item) => item.id === zoneId)
    if (zone) {
      return getLocalizedZoneName(zone, locale.value) || String(zone.denumire || '')
    }
  }

  return ''
})

const title = computed(() => {
  switch (routeName.value) {
    case 'home':
      return t('topbar.titles.home')
    case 'start':
      return t('topbar.titles.startTask')
    case 'finalise':
      return t('topbar.titles.finalizeTask')
    case 'options':
      return t('topbar.titles.options')
    case 'other':
      return t('topbar.titles.otherTasks')
    case 'zone':
      return zoneTitle.value
        ? t('topbar.titles.zoneDetail', { zone: zoneTitle.value })
        : t('topbar.titles.defaultZone')
    default:
      return ''
  }
})

function goBack() {
  router.back()
}

function logout() {
  proxy.$swal.fire({
    title: t('home.logoutConfirm.title'),
    text: t('home.logoutConfirm.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: t('home.logoutConfirm.confirm'),
    cancelButtonText: t('home.logoutConfirm.cancel')
  }).then((result) => {
    if (result.isConfirmed) {
      auth.clearAuth()
      zoneSessions.refreshFromAuth()
      router.push('/')
    }
  })
}
</script>
