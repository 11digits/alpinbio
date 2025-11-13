<template>
  <nav
    v-if="show"
    class="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/80 border-t border-gray-200 shadow-sm flex justify-around py-2"
    style="padding-bottom: calc(env(safe-area-inset-bottom) + 10px)"
  >
    <router-link
      to="/home"
      class="flex flex-col items-center text-xs font-medium"
      :class="{ 'text-blue-600': isActive('/home'), 'text-gray-500': !isActive('/home') }"
    >
      <component
        :is="isActive('/home') ? HomeSolid : HomeOutline"
        class="w-6 h-6 mb-1"
      />
      {{ t('bottomNav.home') }}
    </router-link>

    <router-link
      to="/start-task"
      class="flex flex-col items-center text-xs font-medium"
      :class="{ 'text-blue-600': isActive('/start-task'), 'text-gray-500': !isActive('/start-task') }"
    >
      <component
        :is="isActive('/start-task') ? CameraSolid : CameraOutline"
        class="w-6 h-6 mb-1"
      />
      {{ startLabel }}
    </router-link>

    <router-link
      to="/finalize-task"
      class="flex flex-col items-center text-xs font-medium"
      :class="{ 'text-blue-600': isActive('/finalize-task'), 'text-gray-500': !isActive('/finalize-task') }"
    >
      <component
        :is="isActive('/finalize-task') ? CheckCircleSolid : CheckCircleOutline"
        class="w-6 h-6 mb-1"
      />
      {{ t('bottomNav.finalize') }}
    </router-link>

    <router-link
      to="/options"
      class="flex flex-col items-center text-xs font-medium"
      :class="{ 'text-blue-600': isActive('/options'), 'text-gray-500': !isActive('/options') }"
    >
      <component
        :is="isActive('/options') ? CogSolid : CogOutline"
        class="w-6 h-6 mb-1"
      />
      {{ t('bottomNav.options') }}
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useZoneSessionsStore } from '@/stores/zoneSessions'

import { HomeIcon as HomeOutline } from '@heroicons/vue/24/outline'
import { HomeIcon as HomeSolid } from '@heroicons/vue/24/solid'
import { CameraIcon as CameraOutline } from '@heroicons/vue/24/outline'
import { CameraIcon as CameraSolid } from '@heroicons/vue/24/solid'
import { CheckCircleIcon as CheckCircleOutline } from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import { Cog6ToothIcon as CogOutline } from '@heroicons/vue/24/outline'
import { Cog6ToothIcon as CogSolid } from '@heroicons/vue/24/solid'

const route = useRoute()
const { t } = useI18n()
const zoneSessions = useZoneSessionsStore()

function isActive(path) {
  return route.path === path
}

const hiddenRoutes = ['/', '/login']
const show = computed(() => !hiddenRoutes.includes(route.path))

// 🔑 dynamic label for Start/Active
const startLabel = computed(() => {
  return zoneSessions.activeSession
    ? t('bottomNav.active')
    : t('bottomNav.start')
})
</script>
