<template>
  <div class="p-4 pb-20">
    <div class="max-w-md mx-auto space-y-4">
      <h2 class="text-xl font-bold">{{ t('options.title') }}</h2>
      <div class="bg-white rounded-xl shadow p-6 space-y-4">
        <div v-if="!unlocked" class="space-y-4">
          <p class="text-sm text-gray-600">
            {{ t('options.pinPrompt') }}
          </p>
          <form @submit.prevent="unlock" class="space-y-4 w-full max-w-xs mx-auto">
            <!-- Label + Input -->
            <label class="block w-full">
              <span class="text-sm font-medium text-gray-700">
                {{ t('options.pinLabel') }}
              </span>
              <input
                v-model="pin"
                type="password"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="4"
                class="mt-1 block w-full rounded-lg border border-gray-300 py-3 px-0 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="t('options.pinPlaceholder')"
              />
            </label>

            <!-- Submit button -->
            <button
              type="submit"
              class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {{ t('options.unlockButton') }}
            </button>
          </form>
          <p v-if="error" class="text-sm text-red-600">{{ t('options.invalidPin') }}</p>
        </div>
        <div v-else class="space-y-4">
          <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600">
            {{ t('options.unlockedMessage') }}
          </div>

          <section class="space-y-4 text-left">
            <h3 class="text-lg font-semibold text-gray-800">Location tracking</h3>
            <div class="space-y-4 rounded-xl bg-white p-5 shadow">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Support status</span>
                <span
                  class="font-medium"
                  :class="geolocationState.supported ? 'text-emerald-600' : 'text-red-600'"
                >
                  {{ geolocationState.supported ? 'Available' : 'Unavailable' }}
                </span>
              </div>

              <div v-if="formattedCoords" class="space-y-2 text-sm text-gray-700">
                <div class="flex items-center justify-between">
                  <span>Latitude</span>
                  <span class="font-mono">{{ formattedCoords.latitude }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Longitude</span>
                  <span class="font-mono">{{ formattedCoords.longitude }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Accuracy</span>
                  <span>{{ formattedCoords.accuracy }} m</span>
                </div>
                <p v-if="formattedTimestamp" class="text-xs text-gray-500">
                  Last updated at {{ formattedTimestamp }}
                </p>
              </div>
              <p v-else class="text-sm text-gray-500">No location captured yet.</p>

              <p v-if="geolocationState.error" class="text-sm text-red-600">
                {{ geolocationState.error.message }}
              </p>

              <div class="flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  :disabled="locating || !geolocationState.supported"
                  @click="captureLocation"
                >
                  {{ locating ? 'Locating…' : 'Capture location' }}
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  :disabled="!geolocationState.supported"
                  @click="toggleTracking"
                >
                  {{ isWatching ? 'Stop tracking' : 'Start tracking' }}
                </button>
              </div>
            </div>
          </section>

          <button
            type="button"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="lock"
          >
            {{ t('options.lockButton') }}
          </button>         
        </div>
      </div>
    </div>

    <div class="my-5 text-center">v{{ appVersion }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGeolocation } from '@/plugins/geolocation'

const appVersion = __APP_VERSION__

const { t } = useI18n()

const pin = ref('')
const unlocked = ref(false)
const error = ref(false)
const SECRET_PIN = '9988'
const locating = ref(false)

const geolocation = useGeolocation()
const geolocationState = geolocation.state

const formattedCoords = computed(() => {
  if (!geolocationState.coords) {
    return null
  }

  return {
    latitude: geolocationState.coords.latitude?.toFixed(6) ?? '—',
    longitude: geolocationState.coords.longitude?.toFixed(6) ?? '—',
    accuracy: geolocationState.coords.accuracy?.toFixed(1) ?? '—'
  }
})

const formattedTimestamp = computed(() => {
  if (!geolocationState.timestamp) {
    return null
  }

  return new Date(geolocationState.timestamp).toLocaleTimeString()
})

const isWatching = computed(() => geolocationState.isWatching)

function unlock() {
  if (pin.value.trim() === SECRET_PIN) {
    unlocked.value = true
    error.value = false
    pin.value = ''
  } else {
    error.value = true
  }
}

function lock() {
  unlocked.value = false
  error.value = false
  pin.value = ''
  geolocation.stopWatch()
}

async function captureLocation() {
  locating.value = true

  try {
    await geolocation.getCurrentPosition()
  } catch (error) {
    console.error('Error capturing location:', error)
  } finally {
    locating.value = false
  }
}

function toggleTracking() {
  if (geolocationState.isWatching) {
    geolocation.stopWatch()
    return
  }

  try {
    geolocation.startWatch({
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    })
  } catch (error) {
    console.error('Error starting geolocation watch:', error)
  }
}

onBeforeUnmount(() => {
  geolocation.stopWatch()
})
</script>
