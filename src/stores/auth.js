import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/utils/api'

const SESSION_KEY = 'alpinbio-auth-session'

function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('Nu s-a putut încărca sesiunea stocată.', error)
    return null
  }
}

function persistSession(payload) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
  } catch (error) {
    console.warn('Nu s-a putut salva sesiunea curentă.', error)
  }
}

function clearSession() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.warn('Nu s-a putut șterge sesiunea curentă.', error)
  }
}

function maskName(name) {
  if (!name) return ''

  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const visible = part.slice(0, 2).toUpperCase()
      const remaining = Math.max(part.length - 2, 3)
      return `${visible}${'*'.repeat(remaining)}`
    })
    .join(' ')
}

function normalizeInvoice(invoice) {
  if (!invoice) return null

  const amount = Number.parseFloat(invoice.amount ?? 0) || 0
  const balance = Number.parseFloat(invoice.balance ?? 0) || 0
  const status = deriveStatus(invoice.status, invoice.due_at ?? invoice.dueDate, balance)

  return {
    id: invoice.id,
    number: invoice.number ?? invoice.id,
    customerId: invoice.customerId || invoice.customer_id,
    issueDate: invoice.issueDate || invoice.issued_at,
    dueDate: invoice.dueDate || invoice.due_at,
    amount,
    balance,
    status
  }
}

function deriveStatus(apiStatus, _dueDate, balance) {
  if (apiStatus === 'paid' || balance <= 0) {
    return 'paid'
  }

  return 'unpaid'
}

function normalizeCustomer(customer) {
  if (!customer) return null

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    billingAddress: customer.billing_address
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadStoredSession()

  const customer = ref(stored?.customer ?? null)
  const invoices = ref((stored?.invoices ?? []).map(normalizeInvoice))
  const verified = ref(Boolean(stored?.verified))
  const lastSyncedAt = ref(stored?.lastSyncedAt ?? null)
  const pendingVerification = ref(stored?.pendingVerification ?? null)

  const isLoading = ref(false)
  const contactError = ref(null)
  const codeError = ref(null)

  const isAuthenticated = computed(() => verified.value && !!customer.value)
  const maskedCustomerName = computed(() => maskName(customer.value?.name))
  const outstandingBalance = computed(() =>
    invoices.value.reduce((total, invoice) => {
      if (invoice.status === 'paid') {
        return total
      }

      return total + (Number.isFinite(invoice.balance) ? invoice.balance : invoice.amount)
    }, 0)
  )

  function snapshot() {
    return {
      customer: customer.value,
      invoices: invoices.value,
      verified: verified.value,
      lastSyncedAt: lastSyncedAt.value,
      pendingVerification: pendingVerification.value
    }
  }

  watch([customer, invoices, verified, lastSyncedAt, pendingVerification], () => {
    if (!customer.value && !verified.value && !pendingVerification.value) {
      clearSession()
      return
    }

    persistSession(snapshot())
  }, { deep: true })

  async function requestVerificationCode({ contact, type = 'email' }) {
    const selectedType = type === 'phone' ? 'phone' : 'email'
    const trimmedContact = contact?.toString().trim()

    if (!trimmedContact) {
      contactError.value =
        selectedType === 'phone'
          ? 'Introduceți numărul de telefon înregistrat.'
          : 'Introduceți adresa de email înregistrată.'
      return false
    }

    isLoading.value = true
    contactError.value = null
    codeError.value = null

    try {
      const { data } = await api.post('/auth/start', {
        contact: trimmedContact,
        type: selectedType
      })

      pendingVerification.value = {
        sessionId: data.session_id,
        contactType: data.contact_type ?? selectedType,
        contactValue: trimmedContact,
        maskedContact: data.masked_contact ?? trimmedContact,
        customerHint: data.customer_hint ?? null,
        expiresAt: data.expires_at ?? null,
        debugCode: data.debug_code ?? null
      }

      customer.value = null
      invoices.value = []
      verified.value = false

      return true
    } catch (error) {
      const status = error?.response?.status
      const data = error?.response?.data

      // 🔥 CASE 1: Cooldown (code already generated)
      if (status === 429 && data?.session_id) {

          pendingVerification.value = {
              sessionId: data.session_id,
              contactType: data.contact_type ?? selectedType,
              contactValue: trimmedContact,
              maskedContact: data.masked_contact ?? trimmedContact,
              customerHint: data.customer_hint ?? null,
              expiresAt: data.expires_at ?? null
          }

          // Show cooldown message but do NOT treat as an error
          contactError.value = data.message || 'Codul a fost deja trimis. Verifică mesajele.'

          customer.value = null
          invoices.value = []
          verified.value = false

          return true   // 🔥 important — the flow continues!
      }

      // 🔥 CASE 2: Any real error (404, 422, etc.)
      contactError.value = getErrorMessage(error, 'Nu am găsit niciun client cu aceste informații.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function verifyCode(code) {
    const trimmedCode = code?.toString().trim()

    if (!pendingVerification.value?.sessionId) {
      codeError.value = 'Solicitați un cod de verificare pentru a continua.'
      return false
    }

    if (!trimmedCode) {
      codeError.value = 'Introduceți codul primit prin SMS sau email.'
      return false
    }

    isLoading.value = true
    codeError.value = null

    try {
      const { data } = await api.post('/auth/verify', {
        session_id: pendingVerification.value.sessionId,
        code: trimmedCode
      })

      customer.value = normalizeCustomer(data.customer)
      invoices.value = (data.customer?.invoices ?? data.invoices ?? []).map(normalizeInvoice)
      verified.value = true
      lastSyncedAt.value = new Date().toISOString()
      pendingVerification.value = null

      return true
    } catch (error) {
      codeError.value = getErrorMessage(error, 'Codul introdus nu este corect sau a expirat.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshInvoices() {
    if (!customer.value) {
      return []
    }

    isLoading.value = true
    try {
      const { data } = await api.get(`/customers/${customer.value.id}`)
      customer.value = normalizeCustomer(data)
      invoices.value = (data.invoices ?? []).map(normalizeInvoice)
      lastSyncedAt.value = new Date().toISOString()
      return invoices.value
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInvoice(id) {
    if (!id) {
      return null
    }

    const cached = invoices.value.find((invoice) => invoice.id === id || invoice.number === id)
    if (cached) {
      return cached
    }

    const { data } = await api.get(`/invoices/${encodeURIComponent(id)}`)
    return normalizeInvoice(data)
  }

  function resetPendingVerification() {
    pendingVerification.value = null
    contactError.value = null
    codeError.value = null
  }

  function logout() {
    customer.value = null
    invoices.value = []
    verified.value = false
    lastSyncedAt.value = null
    pendingVerification.value = null
    contactError.value = null
    codeError.value = null
    clearSession()
  }

  return {
    customer,
    invoices,
    verified,
    lastSyncedAt,
    pendingVerification,
    isLoading,
    contactError,
    codeError,
    isAuthenticated,
    maskedCustomerName,
    outstandingBalance,
    requestVerificationCode,
    verifyCode,
    refreshInvoices,
    fetchInvoice,
    resetPendingVerification,
    logout
  }
})
