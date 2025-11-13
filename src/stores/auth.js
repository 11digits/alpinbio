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

function normalizeName(value) {
  return value?.toString().trim().replace(/\s+/g, ' ').toLowerCase() ?? ''
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

  const amount = Number.parseFloat(invoice.amount ?? invoice.balance ?? 0) || 0
  const balance = Number.parseFloat(invoice.balance ?? amount) || 0
  const status = deriveStatus(invoice.status, invoice.due_at, balance)

  return {
    id: invoice.id,
    number: invoice.number ?? invoice.id,
    customerId: invoice.customer_id,
    issueDate: invoice.issued_at,
    dueDate: invoice.due_at,
    amount,
    balance,
    status
  }
}

function deriveStatus(apiStatus, dueDate, balance) {
  if (apiStatus === 'paid' || balance <= 0) {
    return 'paid'
  }

  if (!dueDate) {
    return 'unpaid'
  }

  const due = new Date(dueDate)
  const now = new Date()

  if (Number.isNaN(due.getTime())) {
    return 'unpaid'
  }

  if (due.getTime() < now.setHours(0, 0, 0, 0)) {
    return 'unpaid'
  }

  const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24))
  return diffDays <= 5 ? 'due' : 'unpaid'
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
  const activeInvoice = ref(stored?.activeInvoice ? normalizeInvoice(stored.activeInvoice) : null)
  const verified = ref(Boolean(stored?.verified))
  const invoiceNumber = ref(stored?.invoiceNumber ?? '')
  const lastSyncedAt = ref(stored?.lastSyncedAt ?? null)

  const isLoading = ref(false)
  const invoiceError = ref(null)
  const verificationError = ref(null)

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
      activeInvoice: activeInvoice.value,
      verified: verified.value,
      invoiceNumber: invoiceNumber.value,
      lastSyncedAt: lastSyncedAt.value
    }
  }

  watch([customer, invoices, activeInvoice, verified, invoiceNumber, lastSyncedAt], () => {
    if (!customer.value && !verified.value) {
      clearSession()
      return
    }

    persistSession(snapshot())
  }, { deep: true })

  async function lookupInvoice(number) {
    if (!number) {
      return false
    }

    isLoading.value = true
    invoiceError.value = null
    verificationError.value = null

    try {
      const trimmed = number.trim()
      const { data: invoiceData } = await api.get(`/invoices/${encodeURIComponent(trimmed)}`)

      const normalizedInvoice = normalizeInvoice(invoiceData)
      invoiceNumber.value = trimmed
      activeInvoice.value = normalizedInvoice

      const { data: customerData } = await api.get(`/customers/${normalizedInvoice.customerId}`)

      customer.value = normalizeCustomer(customerData)
      invoices.value = (customerData.invoices ?? []).map(normalizeInvoice)
      lastSyncedAt.value = new Date().toISOString()
      verified.value = false

      return true
    } catch (error) {
      invoiceError.value = getErrorMessage(error, 'Factura introdusă nu a fost găsită.')
      customer.value = null
      invoices.value = []
      activeInvoice.value = null
      verified.value = false
      invoiceNumber.value = number.trim()
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
      invoiceError.value = getErrorMessage(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInvoice(id) {
    if (!id) {
      return null
    }

    try {
      const cached = invoices.value.find((invoice) => invoice.id === id || invoice.number === id)
      if (cached) {
        return cached
      }

      const { data } = await api.get(`/invoices/${encodeURIComponent(id)}`)
      return normalizeInvoice(data)
    } catch (error) {
      invoiceError.value = getErrorMessage(error, 'Factura solicitată nu a putut fi încărcată.')
      throw error
    }
  }

  function verifyCustomerName(inputName) {
    if (!customer.value) {
      verificationError.value = 'Introduceți mai întâi numărul facturii.'
      return false
    }

    const isValid = normalizeName(customer.value.name) === normalizeName(inputName)

    if (isValid) {
      verificationError.value = null
      verified.value = true
      return true
    }

    verificationError.value = 'Numele introdus nu corespunde facturii selectate.'
    return false
  }

  function logout() {
    customer.value = null
    invoices.value = []
    activeInvoice.value = null
    verified.value = false
    invoiceNumber.value = ''
    lastSyncedAt.value = null
    invoiceError.value = null
    verificationError.value = null
    clearSession()
  }

  return {
    customer,
    invoices,
    activeInvoice,
    invoiceNumber,
    verified,
    lastSyncedAt,
    isLoading,
    invoiceError,
    verificationError,
    isAuthenticated,
    maskedCustomerName,
    outstandingBalance,
    lookupInvoice,
    verifyCustomerName,
    refreshInvoices,
    fetchInvoice,
    logout
  }
})
