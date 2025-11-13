import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { api } from '@/plugins/axios' // ✅ use the same instance

const ACTIVE_KEY = 'zone_sessions_active'
const HISTORY_KEY = 'zone_sessions_history'
const QUEUE_KEY = 'zone_sessions_queue'
const DEFAULT_OPERATOR_KEY = 'unauthenticated'

const storage = typeof window !== 'undefined' ? window.localStorage : null

function saveToStorage(key, value) {
  if (!storage) return
  try {
    if (value === null || value === undefined) {
      storage.removeItem(key)
    } else {
      storage.setItem(key, JSON.stringify(value))
    }
  } catch (err) {
    console.warn(`[zoneSessions] Failed to persist ${key}:`, err)
  }
}

function createId(prefix = 'zs') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

let listenerRegistered = false
let authSubscription = null

function resolveOperatorKey(authState) {
  if (!authState) {
    return DEFAULT_OPERATOR_KEY
  }

  const operatorId = authState?.data?.operator?.id
  if (operatorId) {
    return `operator-${operatorId}`
  }

  const pin = authState?.pin
  if (pin) {
    return `pin-${pin}`
  }

  return DEFAULT_OPERATOR_KEY
}

function getStorageKey(baseKey, operatorKey = DEFAULT_OPERATOR_KEY) {
  return `${baseKey}__${operatorKey}`
}

function loadScoped(key, operatorKey, fallback) {
  if (!storage) return fallback

  const scopedKey = getStorageKey(key, operatorKey)

  try {
    const scopedRaw = storage.getItem(scopedKey)
    if (scopedRaw !== null) {
      return JSON.parse(scopedRaw)
    }

    const legacyRaw = storage.getItem(key)
    if (legacyRaw !== null) {
      const parsed = JSON.parse(legacyRaw)
      saveToStorage(scopedKey, parsed)
      storage.removeItem(key)
      return parsed
    }
  } catch (err) {
    console.warn(`[zoneSessions] Failed to parse scoped ${key}:`, err)
  }

  return fallback
}

function loadState(operatorKey) {
  const active = withSessionDefaults(loadScoped(ACTIVE_KEY, operatorKey, null))
  const history = loadScoped(HISTORY_KEY, operatorKey, [])
  const queue = loadScoped(QUEUE_KEY, operatorKey, [])

  return {
    activeSession: active,
    history: Array.isArray(history) ? history.map((entry) => withSessionDefaults(entry)) : [],
    pendingSync: Array.isArray(queue) ? queue : []
  }
}

function withSessionDefaults(session) {
  if (!session) return session

  const normalized = {
    comment: '',
    evidence: [],
    completedOperations: [],
    codeValue: '',
    codeDescription: '',
    ...session
  }

  normalized.evidence = Array.isArray(normalized.evidence) ? normalized.evidence : []
  normalized.completedOperations = Array.isArray(normalized.completedOperations)
    ? Array.from(new Set(normalized.completedOperations))
    : []

  return normalized
}

export const useZoneSessionsStore = defineStore('zoneSessions', {
  state: () => {
    const auth = useAuthStore()
    const operatorKey = resolveOperatorKey(auth)
    const { activeSession, history, pendingSync } = loadState(operatorKey)

    return {
      operatorKey,
      activeSession,
      history,
      pendingSync,
      isSyncing: false
    }
  },
  getters: {
    isBusy: (state) => !!state.activeSession,
    activeZoneId: (state) => state.activeSession?.zoneId ?? null
  },
  actions: {
    initialize() {
      this.refreshFromAuth()

      if (typeof window !== 'undefined' && !listenerRegistered) {
        const store = this
        window.addEventListener('online', () => {
          store.syncPendingSessions()
        })
        listenerRegistered = true
      }

      if (!authSubscription) {
        const auth = useAuthStore()
        authSubscription = auth.$subscribe((_, state) => {
          const nextKey = resolveOperatorKey(state)
          if (nextKey !== this.operatorKey) {
            this.applyOperatorKey(nextKey)
            this.syncPendingSessions()
          }
        }, { detached: true })
      }

      this.syncPendingSessions()
    },
    refreshFromAuth() {
      const auth = useAuthStore()
      const operatorKey = resolveOperatorKey(auth)
      this.applyOperatorKey(operatorKey)
    },
    applyOperatorKey(operatorKey) {
      const resolvedKey = operatorKey || DEFAULT_OPERATOR_KEY
      const { activeSession, history, pendingSync } = loadState(resolvedKey)

      this.operatorKey = resolvedKey
      this.activeSession = activeSession
      this.history = history
      this.pendingSync = pendingSync
    },
    startSession({
      contractId,
      contractName,
      zoneId,
      zoneName,
      code,
      codeValue,
      codeDescription,
      startedAt,
    }) {
      const auth = useAuthStore()

      if (this.activeSession && this.activeSession.zoneId !== zoneId) {
        throw new Error('SESSION_BUSY')
      }

      if (this.activeSession && this.activeSession.zoneId === zoneId) {
        return this.activeSession
      }

      const session = withSessionDefaults({
        id: createId('session'),
        contractId,
        contractName,
        zoneId,
        zoneName,
        code,
        codeValue,
        codeDescription,
        startedAt: startedAt || new Date().toISOString(),
        comment: '',
        evidence: [],
        completedOperations: []
      })

      this.activeSession = session
      this.pendingSync.push({
        id: createId('queue'),
        type: 'start',
        payload: {
          id: this.activeSession.id,
          contractId,
          contractName,
          zoneId,
          zoneName,
          code,
          startedAt: session.startedAt,
          operatorId: auth?.data?.operator?.id || null 
        }
      })

      this.persist()
      this.syncPendingSessions()

      return session
    },
    setActiveComment(comment) {
      if (!this.activeSession) return
      this.activeSession.comment = comment
      this.persist()
    },
    addEvidence(evidenceItems) {
      if (!this.activeSession || !Array.isArray(evidenceItems)) return
      const enriched = evidenceItems.map((item) => ({
        ...item,
        id: createId('photo')
      }))
      this.activeSession.evidence.push(...enriched)
      this.persist()
    },
    toggleOperation(operationId) {
      if (!this.activeSession || !operationId) return

      const current = new Set(this.activeSession.completedOperations || [])
      if (current.has(operationId)) {
        current.delete(operationId)
      } else {
        current.add(operationId)
      }

      this.activeSession.completedOperations = Array.from(current)
      this.persist()
    },
    removeEvidence(id) {
      if (!this.activeSession) return
      this.activeSession.evidence = this.activeSession.evidence.filter((item) => item.id !== id)
      this.persist()
    },
    completeSession({ code } = {}) {
      if (!this.activeSession) {
        throw new Error('NO_ACTIVE_SESSION')
      }
      
      const auth = useAuthStore()
      const completedAt = new Date().toISOString()
      const record = {
        ...withSessionDefaults(this.activeSession),
        completedAt,
        completedCode: code || this.activeSession.code,
        operatorId: auth?.data?.operator?.id || null
      }

      this.history.push(record)
      this.pendingSync.push({
        id: createId('queue'),
        type: 'complete',
        payload: record
      })

      this.activeSession = null
      this.persist()
      this.syncPendingSessions()

      return record
    },
    persist() {
      const operatorKey = this.operatorKey || DEFAULT_OPERATOR_KEY
      const activeKey = getStorageKey(ACTIVE_KEY, operatorKey)
      const historyKey = getStorageKey(HISTORY_KEY, operatorKey)
      const queueKey = getStorageKey(QUEUE_KEY, operatorKey)

      saveToStorage(activeKey, this.activeSession ? withSessionDefaults(this.activeSession) : null)
      saveToStorage(historyKey, this.history.map((entry) => withSessionDefaults(entry)))
      saveToStorage(queueKey, this.pendingSync)
    },
    clearHistory() {
      this.history = []
      this.persist()
    },
    clearQueue() {
      this.pendingSync = []
      this.persist()
    },
    async syncPendingSessions() {
      if (this.isSyncing || !this.pendingSync.length) return
      if (typeof navigator !== 'undefined' && !navigator.onLine) return

      const auth = useAuthStore()
      if (!auth?.token) return

      this.isSyncing = true

      try {
        await api.post('/sync', {
          events: this.pendingSync
        }, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })

        this.pendingSync = []
        this.persist()
      } catch (err) {
        console.warn('[zoneSessions] Sync failed:', err)
      } finally {
        this.isSyncing = false
      }
    }
  }
})
