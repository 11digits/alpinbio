<template>
  <div class="space-y-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-sm text-emerald-700"
      >
        <svg
          class="h-6 w-6 animate-spin text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span>Se încarcă facturile selectate...</span>
      </div>

      <div
        v-else-if="!hasSelection"
        class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600"
      >
        <h2 class="text-lg font-semibold text-slate-900">Nu ai selectat încă nicio factură</h2>
        <p>
          Selectează facturile pe care dorești să le achiți din secțiunea „Listă Facturi” pentru a vedea aici rezumatul plății.
        </p>
        <RouterLink
          to="/invoices"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
        >
          Mergi la lista de facturi
        </RouterLink>
      </div>

      <div
        v-else-if="selectedInvoices.length === 0"
        class="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-sm text-amber-700"
      >
        <p>Nu am reușit să încărcăm detaliile facturilor selectate.</p>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            @click="reloadSelection"
          >
            Reîncearcă încărcarea
          </button>
          <RouterLink
            to="/invoices"
            class="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
          >
            Înapoi la facturi
          </RouterLink>
        </div>
      </div>

      <div v-else class="flex flex-col gap-6 lg:flex-row">
        <div class="flex-1 space-y-5">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Facturi selectate</h2>
            <p class="mt-1 text-sm text-slate-500">
              Ai selectat {{ selectedCount }} {{ selectedCount === 1 ? 'factură' : 'facturi' }} pentru plată.
            </p>
          </div>

          <div
            v-if="errorMessage"
            class="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700"
          >
            {{ errorMessage }}
          </div>

          <ul class="space-y-4">
            <li
              v-for="invoice in selectedInvoices"
              :key="invoice.id"
              class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm font-semibold text-slate-900">Factura {{ invoice.number }}</p>
                  <p class="mt-1 text-xs text-slate-500">
                    Emisă la {{ formatDate(invoice.issueDate) }}
                  </p>
                </div>
                <div class="text-sm text-slate-500 sm:text-right">
                  <p class="text-base font-semibold text-slate-900">
                    {{ formatCurrency(invoice.balance) }}
                  </p>
                  <p class="mt-1">Scadență: {{ formatDate(invoice.dueDate) }}</p>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold"
                  :class="statusClasses(statusMeta(invoice.status).tone)"
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="dotClasses(statusMeta(invoice.status).tone)"
                  ></span>
                  {{ statusMeta(invoice.status).label }}
                </span>
                <RouterLink
                  :to="`/invoices/${invoice.id}/pay`"
                  class="inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  Detalii factură
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
                  </svg>
                </RouterLink>
              </div>
            </li>
          </ul>
        </div>

        <div class="w-full max-w-sm space-y-5 rounded-2xl border border-slate-100 p-6">
          <h2 class="text-lg font-semibold text-slate-900">Sumar plată</h2>
          <dl class="space-y-4 text-sm text-slate-600">
            <div class="flex items-center justify-between">
              <dt>Număr facturi</dt>
              <dd class="font-semibold text-slate-900">{{ selectedCount }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Total de plată</dt>
              <dd class="text-3xl font-bold text-slate-900">
                {{ formatCurrency(selectedTotal) }}
              </dd>
            </div>
            <div v-if="nextDueDate" class="flex items-center justify-between">
              <dt>Cea mai apropiată scadență</dt>
              <dd class="font-semibold text-slate-900">{{ formatDate(nextDueDate) }}</dd>
            </div>
          </dl>

          <div class="space-y-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            <p>Plata se va realiza pe pagina securizată a partenerului nostru.</p>
            <ul class="space-y-2 text-xs">
              <li class="flex items-start gap-2">
                <span class="mt-1 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-emerald-400"></span>
                <span>Verifică încă o dată valorile și scadențele facturilor selectate.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-emerald-400"></span>
                <span>Pregătește datele de plată. După confirmare vei primi o notificare pe e-mail.</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            @click="startExternalPayment"
          >
            Continuă către plata securizată
          </button>

          <p class="text-xs text-slate-400">
            După finalizarea plății vei fi redirecționat înapoi pentru confirmarea tranzacției.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/utils/api'
import { formatCurrency, formatDate, statusMeta } from '@/utils/formatters'

const route = useRoute()
const authStore = useAuthStore()

const selectedInvoices = ref([])
const isLoading = ref(false)
const errorMessage = ref(null)

const selectedInvoiceIds = computed(() => {
  const ids = []

  if (route.params.id) {
    ids.push(route.params.id.toString())
  }

  const queryInvoices = route.query.invoices
  if (Array.isArray(queryInvoices)) {
    queryInvoices.forEach((value) => {
      value
        ?.toString()
        .split(',')
        .forEach((item) => {
          const normalized = item.trim()
          if (normalized) {
            ids.push(normalized)
          }
        })
    })
  } else if (queryInvoices) {
    queryInvoices
      .toString()
      .split(',')
      .forEach((item) => {
        const normalized = item.trim()
        if (normalized) {
          ids.push(normalized)
        }
      })
  }

  const unique = []
  const seen = new Set()
  ids.forEach((id) => {
    if (!seen.has(id)) {
      seen.add(id)
      unique.push(id)
    }
  })

  return unique
})

const hasSelection = computed(() => selectedInvoiceIds.value.length > 0)
const selectedCount = computed(() => selectedInvoices.value.length)
const selectedTotal = computed(() =>
  selectedInvoices.value.reduce((total, invoice) => {
    const balance = Number.isFinite(invoice.balance) ? invoice.balance : 0
    return total + balance
  }, 0)
)

const nextDueDate = computed(() => {
  if (!selectedInvoices.value.length) {
    return null
  }

  const dueDates = selectedInvoices.value
    .map((invoice) => new Date(invoice.dueDate))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  return dueDates[0] ?? null
})

let currentRequestId = 0

async function loadSelectedInvoices(ids) {
  const normalizedIds = Array.isArray(ids) ? ids.filter(Boolean) : []

  if (!normalizedIds.length) {
    selectedInvoices.value = []
    errorMessage.value = null
    isLoading.value = false
    return
  }

  const requestId = ++currentRequestId
  isLoading.value = true
  errorMessage.value = null

  const collected = []
  const seen = new Set()
  const missing = []
  let fetchErrorMessage = null

  for (const id of normalizedIds) {
    try {
      const cached =
        authStore.invoices.find((invoice) => invoice.id === id || invoice.number === id) ??
        (await authStore.fetchInvoice(id))

      if (cached && !seen.has(cached.id)) {
        seen.add(cached.id)
        collected.push(cached)
      } else if (!cached) {
        missing.push(id)
      }
    } catch (error) {
      if (!fetchErrorMessage) {
        fetchErrorMessage = getErrorMessage(error, 'Facturile selectate nu au putut fi încărcate.')
      }
      missing.push(id)
    }
  }

  if (requestId !== currentRequestId) {
    return
  }

  selectedInvoices.value = collected

  if (missing.length) {
    if (collected.length === 0 && fetchErrorMessage) {
      errorMessage.value = fetchErrorMessage
    } else {
      errorMessage.value =
        missing.length === 1
          ? `Nu am putut încărca factura cu identificatorul ${missing[0]}.`
          : `Nu am putut încărca următoarele facturi: ${missing.join(', ')}.`
    }
  } else {
    errorMessage.value = null
  }

  isLoading.value = false
}

function reloadSelection() {
  if (hasSelection.value) {
    loadSelectedInvoices(selectedInvoiceIds.value)
  }
}

watch(
  selectedInvoiceIds,
  (ids) => {
    loadSelectedInvoices(ids)
  },
  { immediate: true }
)

watch(
  () => authStore.invoices,
  () => {
    if (hasSelection.value) {
      loadSelectedInvoices(selectedInvoiceIds.value)
    }
  },
  { deep: true }
)

onMounted(() => {
  if (!authStore.invoices.length) {
    authStore.refreshInvoices().catch(() => {
      // erorile sunt gestionate în store
    })
  }
})

function startExternalPayment() {
  if (!selectedInvoices.value.length) {
    errorMessage.value = 'Selectează cel puțin o factură înainte de a continua plata.'
    return
  }

  if (selectedInvoices.value.length === 1) {
    const invoice = selectedInvoices.value[0]
    window.alert(
      `Vei fi redirecționat către pagina securizată pentru plata facturii ${invoice.number} în valoare de ${formatCurrency(
        invoice.balance
      )}.`
    )
    return
  }

  window.alert(
    `Vei fi redirecționat către pagina securizată pentru plata a ${
      selectedInvoices.value.length
    } facturi în valoare totală de ${formatCurrency(selectedTotal.value)}.`
  )
}

function statusClasses(tone) {
  switch (tone) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700'
    case 'danger':
      return 'bg-rose-50 text-rose-600'
    case 'warning':
      return 'bg-amber-50 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function dotClasses(tone) {
  switch (tone) {
    case 'success':
      return 'bg-emerald-500'
    case 'danger':
      return 'bg-rose-500'
    case 'warning':
      return 'bg-amber-500'
    default:
      return 'bg-slate-400'
  }
}
</script>
