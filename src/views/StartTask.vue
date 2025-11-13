<template>
  <div class="p-4 space-y-6 pb-24 max-w-xl mx-auto">
    <!-- Instructions -->
    <div class="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm p-5">
      <div class="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500" aria-hidden="true" />
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 rounded-xl bg-blue-50 text-blue-600 p-2">
          <InformationCircleIcon class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {{ instructionsTitle }}
          </p>
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ instructionsText }}
          </p>
        </div>
      </div>

      <div v-if="activeSession" class="bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm p-4 text-left">
        <h3 class="text-sm font-semibold text-indigo-800 mb-1">
          {{ t('startTask.finalizeCta.title') }}
        </h3>
        <p class="text-xs text-indigo-700 mb-3">
          {{ t('startTask.finalizeCta.description') }}
        </p>
        <button
          type="button"
          class="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 transition"
          @click="goToFinalize"
        >
          {{ t('startTask.finalizeCta.button') }}
        </button>
      </div>
    </div>

    <!-- No zones warning -->
    <div
      v-if="!activeSession && !hasScannableZones"
      class="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-2xl p-4 shadow-sm text-left"
      role="alert"
    >
      <h3 class="text-sm font-semibold mb-1">{{ t('startTask.noZones.title') }}</h3>
      <p class="text-xs">{{ t('startTask.noZones.text') }}</p>
    </div>

    <!-- Active session info -->
    <div
      v-if="activeSession"
      class="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"
    >
      <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100 opacity-60" aria-hidden="true" />
      <div class="absolute -right-6 -bottom-12 h-24 w-24 rounded-full bg-cyan-100 opacity-50" aria-hidden="true" />
      <div class="relative flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0 space-y-3">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {{ t('startTask.activeZone.title') }}
            </p>
            <p class="text-xl font-bold text-gray-900 break-words">
              {{ activeZoneName }}
            </p>
          </div>
          <div class="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
            <p>{{ t('startTask.activeZone.contract', { contract: activeSession.contractName }) }}</p>
            <p>{{ t('startTask.activeZone.startedAt', { time: formatDate(activeSession.startedAt) }) }}</p>
            <p v-if="activeElapsed" class="sm:col-span-2">
              {{ t('startTask.activeZone.elapsed', { time: activeElapsed }) }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-50 text-green-600 border border-green-200">
            {{ t('startTask.activeStatus.label') }}
          </span>
          <div class="hidden sm:flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 p-3">
            <QrCodeIcon class="w-8 h-8" />
          </div>
        </div>
      </div>

      <div
        v-if="activeQrInfo"
        class="relative mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-800"
      >
        <p class="text-[11px] font-semibold uppercase tracking-wide mb-3">
          {{ t('common.qrDetails.title') }}
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div v-if="activeQrInfo.description" class="flex items-start gap-2">
            <span class="font-medium text-blue-900">{{ t('common.qrDetails.description') }}:</span>
            <span class="font-mono text-[11px] text-blue-800 break-all">{{ activeQrInfo.description }}</span>
          </div>
          <div v-if="activeQrInfo.value" class="flex items-start gap-2">
            <span class="font-medium text-blue-900">{{ t('common.qrDetails.value') }}:</span>
            <span class="font-mono text-[11px] text-blue-800 break-all">{{ activeQrInfo.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Operations -->
    <div v-if="activeSession" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-left">
      <div class="flex items-baseline justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          {{ t('startTask.operations.title') }}
        </h3>
        <span v-if="operations.length" class="text-xs text-gray-500">
          {{ t('startTask.operations.progress', { done: completedCount, total: operations.length }) }}
        </span>
      </div>

      <!-- Progress bar -->
      <div v-if="operations.length" class="h-2 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          class="h-full bg-green-500 transition-all"
          :style="{ width: Math.round((completedCount / operations.length) * 100) + '%' }"
        />
      </div>

      <p class="text-xs text-gray-500 mb-3">
        {{ t('startTask.operations.hint') }}
      </p>

      <ul v-if="operations.length" class="space-y-2 p-0 m-0">
        <li
          v-for="op in operations"
          :key="op.id"
          @click="toggleOperation(op.id)"
          role="checkbox"
          :aria-checked="isOperationDone(op.id)"
          class="flex justify-between items-center p-3 rounded-xl border shadow-sm cursor-pointer select-none transition"
          :class="operationClasses(op.id)"
        >
          <span class="text-sm font-medium text-left pr-4 break-words">
            {{ op.displayName || op.denumire }}
          </span>
          <CheckCircleIcon
            v-if="isOperationDone(op.id)"
            class="w-5 h-5 text-green-600 flex-shrink-0"
          />
          <span v-else class="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
        </li>
      </ul>

      <p v-else class="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
        {{ t('startTask.operations.empty') }}
      </p>
    </div>

    <!-- Finalize CTA -->
    <div v-if="activeSession" class="bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm p-4 text-left">
      <h3 class="text-sm font-semibold text-indigo-800 mb-1">
        {{ t('startTask.finalizeCta.title') }}
      </h3>
      <p class="text-xs text-indigo-700 mb-3">
        {{ t('startTask.finalizeCta.description') }}
      </p>
      <button
        type="button"
        class="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 transition"
        @click="goToFinalize"
      >
        {{ t('startTask.finalizeCta.button') }}
      </button>
    </div>

    <!-- QR Placeholder -->
    <div v-if="!activeSession && hasScannableZones && !scannerActive" 
      class="w-full h-64 mx-auto border rounded-2xl flex flex-col items-center justify-center mb-6 bg-gray-50 shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-20 h-20 text-blue-500 mb-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5h16.5m-16.5 6h16.5m-16.5 6h16.5" />
      </svg>
      <p class="text-gray-500 text-sm text-center">{{ t('startTask.placeholder') }}</p>
    </div>

    <!-- QR Scanner -->
    <div v-else-if="!activeSession && hasScannableZones" class="w-full h-64 mx-auto border-2 border-dashed border-gray-300 rounded-2xl mb-6 overflow-hidden shadow-inner">
      <qrcode-stream @detect="onDetect" @error="onError" />
    </div>

    <!-- Scan button -->
    <button
      v-if="!activeSession"
      @click="toggleScanner"
      class="w-full inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!hasScannableZones"
    >
      {{ scannerActive ? t('startTask.buttons.stop') : t('startTask.buttons.scan') }}
    </button>
  </div>
</template>


<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useZoneSessionsStore } from '@/stores/zoneSessions'
import { useElapsedTime } from '@/composables/useElapsedTime'
import { formatDate as formatDateHelper } from '@/utils/datetime'
import { getLocalizedOperationName, getLocalizedZoneName } from '@/utils/operations'
import { CheckCircleIcon, InformationCircleIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const auth = useAuthStore()
const zoneSessions = useZoneSessionsStore()
const { proxy } = getCurrentInstance()
const scannerActive = ref(false)
const router = useRouter()
const contracts = computed(() => auth.data?.contracts || [])
const activeSession = computed(() => zoneSessions.activeSession)
const { elapsed: activeElapsed } = useElapsedTime(computed(() => activeSession.value?.startedAt))
const hasScannableZones = computed(() =>
  contracts.value.some((contract) =>
    (contract.zones || []).some((zone) => hasOperations(zone))
  )
)
const instructionsTitle = computed(() => {
  if (activeSession.value) {
    return t('startTask.headers.instructions.activeTitle')
  }

  if (!hasScannableZones.value) {
    return t('startTask.headers.instructions.noZonesTitle')
  }

  return t('startTask.headers.instructions.defaultTitle')
})
const instructionsText = computed(() => {
  if (activeSession.value) {
    return t('startTask.activeStatus.hint')
  }

  if (!hasScannableZones.value) {
    return t('startTask.noZones.text')
  }

  return t('startTask.instructions')
})
const activeZone = computed(() => {
  if (!activeSession.value) return null
  const zoneId = activeSession.value.zoneId
  for (const contract of contracts.value) {
    const zone = (contract.zones || []).find((item) => item.id === zoneId)
    if (zone) {
      return zone
    }
  }
  return null
})

const activeZoneName = computed(() => {
  if (activeZone.value) {
    return getZoneName(activeZone.value)
  }

  return String(activeSession.value?.zoneName || '')
})
const operations = computed(() => {
  const list = activeZone.value?.operatiuni || []
  return list.map((operation) => ({
    ...operation,
    displayName: getLocalizedOperationName(operation, locale.value)
  }))
})
const completedOperations = computed(() => zoneSessions.activeSession?.completedOperations || [])
const completedSet = computed(() => new Set(completedOperations.value))
const completedCount = computed(() => completedOperations.value.length)
const activeQrInfo = computed(() => {
  const active = activeSession.value
  if (!active) {
    return null
  }

  const description = String(active.codeDescription || '').trim()
  const value = String(active.codeValue || '').trim()
  const parsed = parseQrCode(active.code)

  const details = {
    description: description || parsed.description,
    value: value || parsed.value
  }

  if (!details.description && !details.value) {
    return null
  }

  return details
})

function toggleScanner() {
  if (!hasScannableZones.value) {
    proxy.$swal.fire({
      icon: 'info',
      title: t('startTask.noZones.title'),
      text: t('startTask.noZones.text'),
      confirmButtonColor: '#2563eb'
    })
    return
  }

  scannerActive.value = !scannerActive.value
}

function goToFinalize() {
  router.push('/finalize-task')
}

function toggleOperation(operationId) {
  if (!operationId) return
  zoneSessions.toggleOperation(operationId)
}

function isOperationDone(operationId) {
  return completedSet.value.has(operationId)
}

function operationClasses(operationId) {
  return isOperationDone(operationId)
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
}

function onDetect(detectedCodes) {
  if (detectedCodes && detectedCodes.length > 0) {
    const scannedCode = detectedCodes[0].rawValue.trim()
    scannerActive.value = false

    if (!scannedCode) {
      return
    }

    const match = findZoneByCode(scannedCode)

    if (!match) {
      proxy.$swal.fire({
        icon: 'error',
        title: t('startTask.errors.unknown.title'),
        text: t('startTask.errors.unknown.text'),
        confirmButtonColor: '#ef4444'
      })
      return
    }

    if (!hasOperations(match.zone)) {
      proxy.$swal.fire({
        icon: 'error',
        title: t('startTask.errors.noOperations.title'),
        text: t('startTask.errors.noOperations.text', { zone: getZoneName(match.zone) }),
        confirmButtonColor: '#ef4444'
      })
      return
    }

    if (zoneSessions.isBusy && zoneSessions.activeZoneId !== match.zone.id) {
      proxy.$swal.fire({
        icon: 'warning',
        title: t('startTask.warnings.busy.title'),
        text: t('startTask.warnings.busy.text', {
          active: activeZoneName.value,
          target: getZoneName(match.zone)
        }),
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (zoneSessions.activeZoneId === match.zone.id) {
      proxy.$swal.fire({
        icon: 'info',
        title: t('startTask.alreadyActive.title'),
        text: t('startTask.alreadyActive.text', { zone: getZoneName(match.zone) }),
        confirmButtonColor: '#2563eb'
      })
      return
    }

    try {
      const qrLabel = match.codeLabel || match.codeDescription || match.codeValue || match.code

      zoneSessions.startSession({
        contractId: match.contract.id,
        contractName: match.contract.denumire,
        zoneId: match.zone.id,
        zoneName: getZoneName(match.zone),
        code: match.code,
        codeValue: match.codeValue,
        codeDescription: match.codeDescription,
        startedAt: new Date().toISOString()
      })

      proxy.$swal.fire({
        icon: 'success',
        title: t('startTask.success.title'),
        text: t('startTask.success.text', {
          zone: getZoneName(match.zone),
          qr: qrLabel
        }),
        confirmButtonColor: '#2563eb'
      })
    } catch (err) {
      console.error('Failed to start session', err)
      proxy.$swal.fire({
        icon: 'error',
        title: t('startTask.errors.generic.title'),
        text: t('startTask.errors.generic.text'),
        confirmButtonColor: '#ef4444'
      })
    }
  }
}

function onError(err) {
  console.error('❌ QR Scanner error:', err.message)
  scannerActive.value = false
  proxy.$swal.fire({
    icon: 'error',
    title: t('startTask.error.title'),
    text: t('startTask.error.text'),
    confirmButtonColor: '#ef4444'
  })
}

function findZoneByCode(code) {
  const normalized = normalize(code)

  for (const contract of contracts.value) {
    for (const zone of contract.zones || []) {
      if (!hasOperations(zone)) {
        continue
      }
      for (const raw of zone.coduri || []) {
        const candidates = createCodeCandidates(raw)
        if (candidates.has(normalized)) {
          const details = extractCodeDetails(raw)

          return {
            contract,
            zone,
            code: raw,
            codeValue: details.value,
            codeDescription: details.description,
            codeLabel: formatCodeLabel(details)
          }
        }
      }
    }
  }

  return null
}

function hasOperations(zone) {
  return Array.isArray(zone?.operatiuni) && zone.operatiuni.length > 0
}

function createCodeCandidates(raw) {
  const set = new Set()
  if (!raw) return set

  const trimmed = normalize(raw)
  set.add(trimmed)

  const [main] = trimmed.split('::')
  if (main) {
    set.add(normalize(main))
  }

  return set
}

function extractCodeDetails(raw) {
  if (typeof raw !== 'string') {
    return {
      value: '',
      description: ''
    }
  }

  const [valuePart = '', descriptionPart = ''] = raw.split('::')

  return {
    value: valuePart.trim(),
    description: descriptionPart.trim()
  }
}

function formatCodeLabel(detailsOrRaw) {
  if (!detailsOrRaw) return ''

  const details =
    typeof detailsOrRaw === 'string' ? extractCodeDetails(detailsOrRaw) : detailsOrRaw

  if (details.description) {
    return details.description
  }

  if (details.value) {
    return details.value
  }

  return typeof detailsOrRaw === 'string' ? detailsOrRaw.trim() : ''
}

function normalize(value) {
  return (value || '').replace(/-/g, '').trim().toUpperCase()
}

function formatDate(value) {
  return formatDateHelper(value, locale.value)
}

function parseQrCode(raw) {
  if (typeof raw !== 'string') {
    return {
      description: '',
      value: ''
    }
  }

  const [valuePart = '', descriptionPart = ''] = raw.split('::')

  return {
    value: valuePart.trim(),
    description: descriptionPart.trim()
  }
}

function getZoneName(zone) {
  return getLocalizedZoneName(zone, locale.value) || String(zone?.denumire || '').trim()
}
</script>
