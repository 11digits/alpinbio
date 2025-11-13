<template>
  <div class="p-4 space-y-6 pb-24 max-w-xl mx-auto">
    <div class="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm p-5">
      <div class="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500" aria-hidden="true" />
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 rounded-xl bg-indigo-50 text-indigo-600 p-2">
          <InformationCircleIcon class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {{ instructionsTitle }}
          </p>
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ instructionsText }}
          </p>
        </div>
      </div>

      <div
        v-if="!activeSession"
        class="mt-2 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900"
        role="alert"
      >
        <p class="text-sm font-semibold mb-1">
          {{ t('finalizeTask.noActiveZone.title') }}
        </p>
        <p>{{ t('finalizeTask.noActiveZone.text') }}</p>
      </div>

      <button
        type="button"
        class="w-full mt-2 inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 transition"
        @click="goToFinalize"
      >
        {{ t('startTask.finalizeCta.button') }}
      </button>
    </div>


    <!-- Shortcut card -->
    <div
      v-if="!activeSession"
      class="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 shadow-sm text-left"
    >
      <h3 class="text-sm font-semibold mb-1">{{ t('finalizeTask.startShortcut.title') }}</h3>
      <p class="text-xs mb-3">{{ t('finalizeTask.startShortcut.description') }}</p>
      <button
        type="button"
        class="w-full inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition"
        @click="goToStart"
      >
        {{ t('finalizeTask.startShortcut.button') }}
      </button>
    </div>

    <!-- Active session info -->
    <div
      v-if="activeSession"
      class="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm text-left"
    >
      <div class="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-indigo-100 opacity-60" aria-hidden="true" />
      <div class="absolute -right-6 -bottom-10 h-28 w-28 rounded-full bg-purple-100 opacity-40" aria-hidden="true" />
      <div class="relative flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0 space-y-3">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              {{ t('finalizeTask.activeZone.title') }}
            </p>
            <p class="text-xl font-bold text-gray-900 break-words">{{ activeZoneName }}</p>
          </div>
          <div class="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
            <p>{{ t('finalizeTask.activeZone.contract', { contract: activeSession.contractName }) }}</p>
            <p>{{ t('finalizeTask.activeZone.startedAt', { time: formatDate(activeSession.startedAt) }) }}</p>
            <p v-if="activeElapsed" class="sm:col-span-2">
              {{ t('finalizeTask.activeZone.elapsed', { time: activeElapsed }) }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-50 text-green-600 border border-green-200">
            {{ t('startTask.activeStatus.label') }}
          </span>
          <div class="hidden sm:flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 p-3">
            <QrCodeIcon class="w-8 h-8" />
          </div>
        </div>
      </div>

      <div
        v-if="activeQrInfo"
        class="relative mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 text-xs text-indigo-800"
      >
        <p class="text-[11px] font-semibold uppercase tracking-wide mb-3">
          {{ t('common.qrDetails.title') }}
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div v-if="activeQrInfo.description" class="flex items-start gap-2">
            <span class="font-medium text-indigo-900">{{ t('common.qrDetails.description') }}:</span>
            <span class="font-mono text-[11px] break-all">{{ activeQrInfo.description }}</span>
          </div>
          <div v-if="activeQrInfo.value" class="flex items-start gap-2">
            <span class="font-medium text-indigo-900">{{ t('common.qrDetails.value') }}:</span>
            <span class="font-mono text-[11px] break-all">{{ activeQrInfo.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Photos card -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-left">
      <h3 class="text-sm font-semibold text-gray-800 mb-2">{{ t('finalizeTask.photos.title') }}</h3>
      <p v-if="!photos.length" class="text-xs text-gray-500 mb-3">
        {{ t('finalizeTask.photos.empty') }}
      </p>
      <div v-else class="grid grid-cols-3 gap-2 mb-4">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="relative border border-gray-200 rounded-lg overflow-hidden"
        >
          <img :src="photo.dataUrl" alt="evidence" class="w-full h-24 object-cover" />
          <button
            type="button"
            class="absolute top-1 right-1 bg-white/80 text-red-500 text-xs px-2 py-0.5 rounded"
            @click="removePhoto(photo.id)"
          >
            {{ t('common.buttons.remove') }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 bg-gray-200 px-4 py-2 rounded text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="triggerPhotoSelect"
        :disabled="!activeSession"
      >
        <span aria-hidden="true">📷</span> {{ t('common.buttons.addPhotos') }}
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        class="hidden"
        @change="handlePhotoSelection"
      />
    </div>

    <!-- Notes card -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-left">
      <label class="block">
        <span class="block text-sm font-semibold text-gray-800 mb-2">
          {{ t('finalizeTask.commentLabel') }}
        </span>
        <div class="rounded-lg overflow-hidden border">
          <textarea
            v-model="comment"
            class="w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            :placeholder="t('common.placeholders.notes')"
            rows="3"
            :disabled="!activeSession"
          ></textarea>
        </div>
      </label>
    </div>

    <!-- QR scanner placeholder / live -->
    <div
      v-if="activeSession && !scannerActive"
      ref="scannerSection"
      class="w-full h-64 mx-auto border rounded-2xl flex flex-col items-center justify-center bg-gray-50 shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke-width="1.5" stroke="currentColor"
        class="w-20 h-20 text-blue-500 mb-2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3.75 4.5h16.5m-16.5 6h16.5m-16.5 6h16.5" />
      </svg>
      <p class="text-gray-500 text-sm text-center">{{ t('finalizeTask.placeholder') }}</p>
    </div>
    <div
      v-else-if="activeSession"
      class="w-full h-64 mx-auto border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden shadow-inner"
    >
      <qrcode-stream @detect="onDetect" @error="onError" />
    </div>

    <!-- Scan button -->
    <button
      v-if="activeSession"
      @click="toggleScanner"
      class="w-full inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ scannerActive ? t('finalizeTask.buttons.stop') : t('finalizeTask.buttons.scan') }}
    </button>
  </div>
</template>


<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useAuthStore } from '@/stores/auth'
import { useZoneSessionsStore } from '@/stores/zoneSessions'
import { useElapsedTime } from '@/composables/useElapsedTime'
import { formatDate as formatDateHelper, formatDuration as formatDurationHelper } from '@/utils/datetime'
import { getLocalizedZoneName } from '@/utils/operations'
import { useRouter } from 'vue-router'
import { InformationCircleIcon, QrCodeIcon } from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const { proxy } = getCurrentInstance()
const auth = useAuthStore()
const zoneSessions = useZoneSessionsStore()

const scannerActive = ref(false)
const comment = ref('')
const fileInput = ref(null)
const router = useRouter()

const scannerSection = ref(null)

const activeSession = computed(() => zoneSessions.activeSession)
const { elapsed: activeElapsed } = useElapsedTime(computed(() => activeSession.value?.startedAt))
const contracts = computed(() => auth.data?.contracts || [])
const photos = computed(() => activeSession.value?.evidence || [])

const activeZone = computed(() => {
  const zoneId = activeSession.value?.zoneId
  if (!zoneId) {
    return null
  }

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

const instructionsText = computed(() =>
  activeSession.value
    ? t('finalizeTask.instructionsActive', { zone: activeZoneName.value })
    : t('finalizeTask.instructions')
)
const instructionsTitle = computed(() =>
  activeSession.value
    ? t('finalizeTask.headers.instructions.activeTitle')
    : t('finalizeTask.headers.instructions.defaultTitle')
)
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

function goToFinalize() {
  if (!activeSession.value) {
    proxy.$swal.fire({
      icon: 'warning',
      title: t('finalizeTask.noActiveZone.title'),
      text: t('finalizeTask.noActiveZone.text'),
      confirmButtonColor: '#2563eb'
    })
    return
  }

  // scroll to scanner
  scannerSection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // activate scanner
  scannerActive.value = true
}

function toggleScanner() {
  if (!activeSession.value) {
    proxy.$swal.fire({
      icon: 'warning',
      title: t('finalizeTask.noActiveZone.title'),
      text: t('finalizeTask.noActiveZone.text'),
      confirmButtonColor: '#2563eb'
    })
    return
  }

  scannerActive.value = !scannerActive.value
}

function goToStart() {
  router.push('/start-task')
}

function onDetect(detectedCodes) {
  if (detectedCodes && detectedCodes.length > 0) {
    if (!activeSession.value) {
      scannerActive.value = false
      proxy.$swal.fire({
        icon: 'warning',
        title: t('finalizeTask.noActiveZone.title'),
        text: t('finalizeTask.noActiveZone.text'),
        confirmButtonColor: '#2563eb'
      })
      return
    }

    scannerActive.value = false
    const scannedCode = detectedCodes[0].rawValue.trim()

    if (!codesMatch(scannedCode, activeSession.value.code)) {
      proxy.$swal.fire({
        icon: 'error',
        title: t('finalizeTask.errors.mismatch.title'),
        text: t('finalizeTask.errors.mismatch.text', { zone: activeZoneName.value }),
        confirmButtonColor: '#ef4444'
      })
      return
    }

    try {
      const zoneName = activeZoneName.value
      if (zoneSessions.activeSession) {
        zoneSessions.activeSession.zoneName = zoneName
      }

      const snapshot = {
        zoneName,
        contractName: activeSession.value.contractName,
        startedAt: activeSession.value.startedAt,
        zoneId: activeSession.value.zoneId,
        operations: findZoneOperations(activeSession.value.zoneId)
      }

      const completed = zoneSessions.completeSession({ code: scannedCode })
      comment.value = ''

      const summaryHtml = buildSummaryHtml(snapshot, completed)

      proxy.$swal.fire({
        icon: 'success',
        title: t('finalizeTask.success.title'),
        text: t('finalizeTask.success.text', { zone: zoneName || completed.zoneName }),
        html: summaryHtml,
        confirmButtonColor: '#2563eb'
      }).then(() => {
        router.push('/home')
      });
    } catch (err) {
      console.error('❌ Failed to complete session:', err)
      proxy.$swal.fire({
        icon: 'error',
        title: t('finalizeTask.errors.generic.title'),
        text: t('finalizeTask.errors.generic.text'),
        confirmButtonColor: '#ef4444'
      })
    }
  }
}

function onError(err) {
  console.error("❌ QR Scanner error:", err.message)
  proxy.$swal.fire({
    title: t('finalizeTask.error.title'),
    text: t('finalizeTask.error.text'),
    icon: 'error',
    confirmButtonColor: '#ef4444'
  })
}

async function handlePhotoSelection(event) {
  if (!activeSession.value) return

  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const items = []

  for (const file of files) {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      items.push({
        name: file.name,
        size: file.size,
        type: file.type,
        capturedAt: new Date().toISOString(),
        dataUrl
      })
    } catch (err) {
      console.warn('Failed to read file', err)
    }
  }

  if (items.length) {
    zoneSessions.addEvidence(items)
  }

  event.target.value = ''
}

function triggerPhotoSelect() {
  if (!activeSession.value) {
    proxy.$swal.fire({
      icon: 'warning',
      title: t('finalizeTask.noActiveZone.title'),
      text: t('finalizeTask.noActiveZone.text'),
      confirmButtonColor: '#2563eb'
    })
    return
  }

  fileInput.value?.click()
}

function removePhoto(id) {
  zoneSessions.removeEvidence(id)
}

function codesMatch(scanned, stored) {
  if (!scanned || !stored) return false
  const normalized = normalize(scanned)
  const candidates = createCodeCandidates(stored)
  return candidates.has(normalized)
}

function createCodeCandidates(raw) {
  const set = new Set()
  const trimmed = normalize(raw)
  if (!trimmed) return set

  set.add(trimmed)
  const [main] = trimmed.split('::')
  if (main) {
    set.add(normalize(main))
  }

  return set
}

function normalize(value) {
  return (value || '').replace(/-/g, '').trim().toUpperCase()
}

function formatDate(value) {
  return formatDateHelper(value, locale.value)
}

function getZoneName(zone) {
  return getLocalizedZoneName(zone, locale.value) || String(zone?.denumire || '').trim()
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

watch(
  () => activeSession.value?.comment,
  (value) => {
    comment.value = value || ''
  },
  { immediate: true }
)

watch(comment, (value) => {
  if (zoneSessions.activeSession) {
    zoneSessions.setActiveComment(value)
  }
})

function findZoneOperations(zoneId) {
  for (const contract of contracts.value) {
    const zone = (contract.zones || []).find((item) => item.id === zoneId)
    if (zone) {
      return zone.operatiuni || []
    }
  }

  return []
}

function buildSummaryHtml(snapshot, completed) {
  const startedAt = formatDate(snapshot.startedAt)
  const completedAt = formatDate(completed.completedAt)
  const duration = formatDurationHelper(snapshot.startedAt, completed.completedAt) || '-'
  const operationsTotal = snapshot.operations.length
  const operationsDone = (completed.completedOperations || []).length

  const operationsText = t('finalizeTask.success.summary.operationsValue', {
    done: operationsDone,
    total: operationsTotal
  })

  const commentText = (completed.comment || '').trim()
  const commentHtml = commentText
    ? `<div class="mt-3"><p class="font-medium text-gray-700">${t('finalizeTask.success.summary.comment')}</p><p>${escapeHtml(commentText)}</p></div>`
    : ''

  return `
    <div class="text-left text-sm leading-relaxed">
      <p class="font-semibold mb-2">${t('finalizeTask.success.summary.title')}</p>
      <ul class="space-y-1 p-0 m-0">
        <li><span class="font-medium text-gray-700">${t('finalizeTask.success.summary.zone')}:</span> ${escapeHtml(snapshot.zoneName)}</li>
        <li><span class="font-medium text-gray-700">${t('finalizeTask.success.summary.contract')}:</span> ${escapeHtml(snapshot.contractName)}</li>
        <li><span class="font-medium text-gray-700">${t('finalizeTask.success.summary.startedAt')}:</span> ${escapeHtml(startedAt)}</li>
        <li><span class="font-medium text-gray-700">${t('finalizeTask.success.summary.completedAt')}:</span> ${escapeHtml(completedAt)}</li>
        <li><span class="font-medium text-gray-700">${t('finalizeTask.success.summary.duration')}:</span> ${escapeHtml(duration)}</li>
        <li><span class="font-medium text-gray-700">${t('finalizeTask.success.summary.operations')}:</span> ${escapeHtml(operationsText)}</li>
      </ul>
      ${commentHtml}
    </div>
  `
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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
</script>
