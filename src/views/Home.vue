<template>
  <div class="p-4 space-y-6 pb-24">
    <!-- Operator info card -->
    <div class="bg-blue-600 text-white rounded-xl shadow-md p-4 space-y-3">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-sm font-semibold flex items-center gap-2 text-white">
          <UserIcon class="w-6 h-6 text-white" />
          {{ auth.data?.operator?.nume_prenume }}
        </h2>
        <div class="text-sm bg-white/20 px-3 py-1 rounded-full">
          {{ contracts.length }} {{ t('options.contracts') }}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/90">
        <span
          class="inline-flex items-center gap-2 font-semibold"
        >
          <span
            class="inline-flex h-2.5 w-2.5 rounded-full"
            :class="isOnline ? 'bg-emerald-300 animate-pulse shadow-[0_0_0_3px_rgba(16,185,129,0.35)]' : 'bg-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.35)]'"
          ></span>
          {{ isOnline ? t('home.syncStatus.online') : t('home.syncStatus.offline') }}
        </span>
        <span class="hidden sm:inline-flex text-white/50">•</span>
        <span class="inline-flex items-center gap-1">
          <span class="font-semibold">{{ t('home.syncStatus.label') }}</span>
          <span>{{ pendingSyncLabel }}</span>
        </span>
      </div>
    </div>

    <!-- Contracts & Zones -->
    <div v-if="hasAvailableZones" class="space-y-6">
      <div v-for="contract in contractsWithZones" :key="contract.id" class="space-y-4">
        <div class="flex flex-col gap-2 border-b border-gray-200 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-base font-bold text-gray-800">
            {{ contract.denumire }}, {{ contract.zones.length }} {{ t('home.zones') }}
          </h2>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="hasOperatorId
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500 focus:ring-offset-blue-100'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed focus:ring-gray-300'
            "
            :disabled="!hasOperatorId"
            :aria-disabled="!hasOperatorId"
            @click="openDailyReport(contract)"
          >
            <DocumentTextIcon class="h-4 w-4" />
            <span>{{ t('home.dailyReport.button') }}</span>
          </button>
        </div>

        <div
          v-for="zone in contract.zones"
          :key="zone.id"
          :class="zoneCardClasses(zone)"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ getZoneName(zone) }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ t('home.zoneProgress', {
                  completed: countTasks(zone, 'completed'),
                  total: zone.operatiuni?.length || 0
                }) }}
              </p>
            </div>
            <span
              v-if="isZoneActive(zone)"
              class="text-[10px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-1 rounded-full shadow-sm animate-pulse"
            >
              {{ t('home.activeBadge') }}
            </span>
          </div>

          <div
            v-if="isZoneActive(zone) && activeQrInfo?.zoneId === zone.id"
            class="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-3 py-2 mb-3 space-y-1"
          >
            <p v-if="activeQrInfo?.description" class="font-medium">
              {{ t('home.activeQr.description', { description: activeQrInfo.description }) }}
            </p>
            <p v-if="activeQrInfo?.value" class="font-mono text-[11px]">
              {{ t('home.activeQr.value', { value: activeQrInfo.value }) }}
            </p>
          </div>

          <div
            v-if="!hasOperations(zone)"
            class="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2 mb-3"
          >
            {{ t('home.noOperationsHint') }}
          </div>

          <!-- Status counts -->
          <div class="flex gap-2 text-xs mb-4">
            <span class="bg-red-100 text-red-600 px-2 py-1 rounded-full">
              {{ countTasks(zone, 'pending') }} {{ t('statuses.pending') }}
            </span>
            <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {{ countTasks(zone, 'inProgress') }} {{ t('statuses.inProgress') }}
            </span>
            <span class="bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {{ countTasks(zone, 'completed') }} {{ t('statuses.completed') }}
            </span>
          </div>

          <!-- Open button -->
          <router-link
            v-if="hasOperations(zone)"
            :to="{ name: 'zone', params: { id: zone.id } }"
            class="w-full block bg-blue-600 text-white py-2 rounded-md text-center text-sm font-medium hover:bg-blue-700 no-underline transition"
          >
            {{ t('common.buttons.open') }} ⎆
          </router-link>
          <button
            v-else
            type="button"
            class="w-full block bg-gray-200 text-gray-500 py-2 rounded-md text-center text-sm font-medium cursor-not-allowed"
            disabled
          >
            {{ t('home.noOperationsButton') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-center bg-white border border-dashed border-gray-200 rounded-xl p-8 h-64"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="w-12 h-12 text-blue-400 mb-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 7.5l9-4.5 9 4.5m-18 0l9 4.5m-9-4.5V16.5l9 4.5m0-9V21m9-13.5l-9 4.5"
        />
      </svg>
      <h3 class="text-base font-semibold text-gray-800 mb-2">
        {{ t('home.emptyState.title') }}
      </h3>
      <p class="text-sm text-gray-500 max-w-sm">
        {{ t('home.emptyState.description') }}
      </p>
    </div>
    <div
      v-if="isReportModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      @click.self="closeReportModal"
    >
      <div class="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ t('home.dailyReport.title') }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ selectedReportContract?.denumire }} · {{ reportDateLabel }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :aria-label="t('common.buttons.close')"
            @click="closeReportModal"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        <div
          v-if="canSelectReportOperator"
          class="border-b border-gray-200 bg-gray-50 px-6 py-4"
        >
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700"
              for="daily-report-operator"
            >
              {{ t('home.dailyReport.selectOperatorLabel') }}
            </label>
            <select
              id="daily-report-operator"
              v-model="selectedReportOperatorId"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                {{ t('home.dailyReport.selectOperatorPlaceholder') }}
              </option>
              <option
                v-for="operator in operatorOptions"
                :key="operator.id"
                :value="String(operator.id)"
              >
                {{ operator.nume_prenume }}
              </option>
            </select>
            <p
              v-if="isLoadingOperators"
              class="text-xs text-gray-500"
            >
              {{ t('home.dailyReport.loadingOperators') }}
            </p>
            <p
              v-else-if="operatorLoadFailed"
              class="text-xs text-red-500"
            >
              {{ t('home.dailyReport.operatorFetchError') }}
            </p>
          </div>
        </div>
        <div class="flex-1 bg-gray-50">
          <iframe
            v-if="reportUrl"
            :key="reportUrl"
            :src="`${reportUrl}#zoom=page-width`"
            :title="t('home.dailyReport.title')"
            class="h-full w-full bg-white"
          ></iframe>
          <div v-else class="flex h-full items-center justify-center px-6 text-center">
            <p class="text-sm text-gray-500">
              {{ t('home.dailyReport.unavailable') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
iframe {
  width: 100% !important;
  height: 100% !important;
  border: none;
}
</style>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useZoneSessionsStore } from '@/stores/zoneSessions'
import { isSameDay } from '@/utils/datetime'
import { DocumentTextIcon, UserIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { getLocalizedZoneName } from '@/utils/operations'

const { t, locale } = useI18n()
const auth = useAuthStore()
const zoneSessions = useZoneSessionsStore()

// --- ONLINE STATUS ---
const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

function updateNetworkStatus() {
  if (typeof navigator === 'undefined') {
    isOnline.value = true
    return
  }
  isOnline.value = navigator.onLine
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  updateNetworkStatus()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', updateNetworkStatus)
    window.removeEventListener('offline', updateNetworkStatus)
    window.removeEventListener('keydown', handleEscapeKey)
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('overflow-hidden')
  }
})

// --- CONTRACTS & ZONES ---
const contracts = computed(() => auth.data?.contracts || [])
const contractsWithZones = computed(() =>
  contracts.value
    .map((contract) => ({
      ...contract,
      zones: contract.zones || []
    }))
    .filter((contract) => (contract.zones || []).length > 0)
)
const hasAvailableZones = computed(() => contractsWithZones.value.length > 0)

// --- SYNC INFO ---
const activeSession = computed(() => zoneSessions.activeSession)
const pendingSyncCount = computed(() =>
  Array.isArray(zoneSessions.pendingSync) ? zoneSessions.pendingSync.length : 0
)
const pendingSyncLabel = computed(() => {
  if (pendingSyncCount.value === 0) return t('home.syncStatus.pendingNone')
  if (pendingSyncCount.value === 1) return t('home.syncStatus.pendingSingle')
  return t('home.syncStatus.pendingPlural', { count: pendingSyncCount.value })
})

// --- OPERATOR INFO ---
const hasOperatorId = computed(() => Boolean(auth.data?.operator?.id))
const defaultOperatorId = computed(() =>
  auth.data?.operator?.id ? String(auth.data.operator.id) : ''
)

// --- DAILY REPORT MODAL ---
const selectedReportContract = ref(null)
const isReportModalOpen = computed(() => Boolean(selectedReportContract.value))
const selectedReportOperatorId = ref(defaultOperatorId.value)
const reportDateParam = computed(() => formatDateForReport(new Date()))

// show operator dropdown only if functia === 1 or 3
const canSelectReportOperator = computed(() => {
  const functia = String(auth.data?.operator?.functia || '')
  return functia === '1' || functia === '3'
})

// ✅ Use only operators from the selected contract
const availableOperators = computed(() => {
  if (!selectedReportContract.value) return []
  return selectedReportContract.value.operatori || []
})

// derived dropdown options (sorted)
const operatorOptions = computed(() => {
  if (!Array.isArray(availableOperators.value)) return []
  return [...availableOperators.value].sort((a, b) => {
    const nameA = String(a?.nume_prenume || '').toLowerCase()
    const nameB = String(b?.nume_prenume || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
})

const isLoadingOperators = ref(false)
const operatorLoadFailed = ref(false)

// ensures operator selection defaults properly
async function ensureOperatorsLoaded() {
  if (!selectedReportOperatorId.value) {
    selectedReportOperatorId.value = defaultOperatorId.value
  }
}

// --- REPORT URL ---
const reportUrl = computed(() => {
  const contract = selectedReportContract.value
  const operatorId = canSelectReportOperator.value
    ? selectedReportOperatorId.value
    : defaultOperatorId.value

  if (!contract || !operatorId) return ''

  const baseUrl = 'https://app.totalclean.ro/api/v1/ttctrack/report'
  const apiKey = 'XHF3D-SSE4R-21323-A2SFF'
  const url = new URL(baseUrl)
  url.searchParams.set('apiKey', apiKey)
  url.searchParams.set('date', reportDateParam.value)
  url.searchParams.set('operatorId', operatorId)
  url.searchParams.set('contractId', contract.id)
  url.searchParams.set('html', 1)
  return url.toString()
})

// --- DATE LABEL ---
const reportDateLabel = computed(() => {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date())
  } catch {
    return reportDateParam.value
  }
})

// --- QR INFO ---
const activeQrInfo = computed(() => {
  const active = activeSession.value
  if (!active) return null
  const description = String(active.codeDescription || '').trim()
  const value = String(active.codeValue || '').trim()
  const parsed = parseQrCode(active.code)
  const details = {
    description: description || parsed.description,
    value: value || parsed.value
  }
  if (!details.description && !details.value) return null
  return { zoneId: active.zoneId, ...details }
})

// --- HISTORY ---
const todayHistoryByZone = computed(() => {
  const result = new Map()
  const today = new Date()
  for (const entry of zoneSessions.history) {
    const reference = entry.completedAt || entry.startedAt
    if (reference && isSameDay(reference, today)) {
      result.set(entry.zoneId, entry)
    }
  }
  return result
})

// --- HELPERS ---
function countTasks(zone, status) {
  const operations = zone.operatiuni || []
  if (!operations.length) return 0
  const completedSet = getCompletedOperationsSet(zone)
  if (status === 'completed') {
    return operations.filter((op) => completedSet.has(String(op.id))).length
  }
  if (status === 'inProgress') {
    if (!isZoneActive(zone)) return 0
    return operations.filter((op) => !completedSet.has(String(op.id))).length
  }
  if (isZoneActive(zone)) return 0
  return operations.filter((op) => !completedSet.has(String(op.id))).length
}

function getCompletedOperationsSet(zone) {
  const active = activeSession.value
  if (active && active.zoneId === zone.id) {
    return new Set((active.completedOperations || []).map((id) => String(id)))
  }
  const history = todayHistoryByZone.value.get(zone.id)
  if (history) {
    return new Set((history.completedOperations || []).map((id) => String(id)))
  }
  return new Set()
}

function isZoneActive(zone) {
  return activeSession.value?.zoneId === zone.id
}

function zoneCardClasses(zone) {
  return [
    'border border-gray-200 rounded-lg shadow-sm p-2',
    {
      'opacity-[0.50]': !hasOperations(zone),
      'border-blue-500 scale-[1.01] ring-4 ring-blue-200 bg-[#E6F0FF] p-4': isZoneActive(zone),
      'bg-white': !isZoneActive(zone)
    }
  ]
}

function hasOperations(zone) {
  return Array.isArray(zone?.operatiuni) && zone.operatiuni.length > 0
}

function parseQrCode(raw) {
  if (typeof raw !== 'string') return { description: '', value: '' }
  const [valuePart = '', descriptionPart = ''] = raw.split('::')
  return { value: valuePart.trim(), description: descriptionPart.trim() }
}

function formatDateForReport(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getZoneName(zone) {
  return getLocalizedZoneName(zone, locale.value) || String(zone?.denumire || '').trim()
}

// --- MODAL LOGIC ---
async function openDailyReport(contract) {
  if (!hasOperatorId.value) return
  selectedReportContract.value = contract
  if (canSelectReportOperator.value) {
    await ensureOperatorsLoaded()
  }
}

function closeReportModal() {
  selectedReportContract.value = null
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') closeReportModal()
}

// --- WATCHERS ---
watch(isReportModalOpen, (isOpen) => {
  if (typeof window !== 'undefined') {
    if (isOpen) window.addEventListener('keydown', handleEscapeKey)
    else window.removeEventListener('keydown', handleEscapeKey)
  }
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('overflow-hidden', isOpen)
  }
})

watch(defaultOperatorId, (nextId) => {
  if (!nextId) {
    selectedReportOperatorId.value = ''
    return
  }
  if (!canSelectReportOperator.value || !selectedReportOperatorId.value) {
    selectedReportOperatorId.value = nextId
  }
})

watch(canSelectReportOperator, (canSelect) => {
  if (!canSelect) {
    selectedReportOperatorId.value = defaultOperatorId.value
  } else if (!availableOperators.value.length && isReportModalOpen.value) {
    ensureOperatorsLoaded()
  }
})
</script>


