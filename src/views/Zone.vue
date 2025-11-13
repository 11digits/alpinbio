<template>
  <div class="p-4 pb-20">
    <h2 class="text-xl font-bold mb-4 text-blue-600">
      {{ zoneName || t('options.zoneNotFound') }}
    </h2>

    <ul v-if="zone" class="space-y-2 list-none m-0 p-0 ">
      <li
        v-for="op in operations"
        :key="op.id"
        class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <span class="max-w-[70%] break-words">{{ op.displayName }}</span>
        <span
          :class="statusClass(op.status)"
          class="px-2 py-0.5 rounded-full text-xs font-medium"
        >
          {{ t(`statuses.${op.status}`) }}
        </span>
      </li>
    </ul>

    <router-link
      to="/home"
      class="block mt-6 text-center text-blue-600 font-medium"
    >
      ← {{ t('common.buttons.back') }}
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useZoneSessionsStore } from '@/stores/zoneSessions'
import { isSameDay } from '@/utils/datetime'
import { getLocalizedOperationName, getLocalizedZoneName } from '@/utils/operations'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const zoneSessions = useZoneSessionsStore()

// Find zone by :id param
const zone = computed(() => {
  const id = route.params.id
  for (const contract of auth.data?.contracts || []) {
    const found = contract.zones.find(z => z.id === id)
    if (found) return found
  }
  return null
})

const zoneName = computed(() => {
  if (!zone.value) {
    return ''
  }

  return getLocalizedZoneName(zone.value, locale.value) || String(zone.value.denumire || '').trim()
})

const operations = computed(() => {
  if (!zone.value) {
    return []
  }

  const zoneId = zone.value.id
  const baseOperations = Array.isArray(zone.value.operatiuni)
    ? zone.value.operatiuni
    : []

  const today = new Date()
  const historyCounts = buildHistoryCounts(zoneId, today)

  const activeSession = zoneSessions.activeSession
  const isActiveZone = activeSession?.zoneId === zoneId
  const activeCompletedSet = isActiveZone
    ? new Set((activeSession.completedOperations || []).map(id => String(id)))
    : new Set()

  return baseOperations.map(operation => {
    const opId = String(operation.id)
    const historyCount = Number(historyCounts[opId] || 0)
    const isCurrentlyCompleted = isActiveZone && activeCompletedSet.has(opId)
    const completedOccurrences = historyCount + (isCurrentlyCompleted ? 1 : 0)

    const localizedName = getLocalizedOperationName(operation, locale.value)

    const status = resolveStatus({
      baseStatus: operation.status,
      historyCount,
      isActiveZone,
      isCurrentlyCompleted
    })

    return {
      ...operation,
      status,
      localizedName,
      displayName:
        completedOccurrences > 1
          ? `${completedOccurrences} x ${localizedName}`
          : localizedName
    }
  })
})

function buildHistoryCounts(zoneId, today) {
  if (!zoneId) {
    return {}
  }

  const counts = {}

  for (const entry of zoneSessions.history) {
    const reference = entry.completedAt || entry.startedAt
    if (!entry.zoneId || entry.zoneId !== zoneId) {
      continue
    }

    if (!reference || !isSameDay(reference, today)) {
      continue
    }

    for (const opId of entry.completedOperations || []) {
      const key = String(opId)
      counts[key] = (counts[key] || 0) + 1
    }
  }

  return counts
}

function resolveStatus({ baseStatus, historyCount, isActiveZone, isCurrentlyCompleted }) {
  if (isActiveZone) {
    return isCurrentlyCompleted ? 'completed' : 'inProgress'
  }

  if (historyCount > 0) {
    return 'completed'
  }

  return normalizeStatus(baseStatus)
}

function normalizeStatus(status) {
  if (status === 'pending' || status === 'inProgress' || status === 'completed') {
    return status
  }

  const value = typeof status === 'string' ? status.trim().toLowerCase() : ''

  switch (value) {
    case 'completed':
    case 'complete':
      return 'completed'
    case 'inprogress':
    case 'in_progress':
      return 'inProgress'
    case 'pending':
      return 'pending'
    default:
      return 'pending'
  }
}

function statusClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-red-500 text-white'
    case 'inProgress':
      return 'bg-blue-500 text-white'
    case 'completed':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}
</script>
