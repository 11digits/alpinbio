<template>
  <div class="space-y-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Listă Facturi</h1>
          <p class="text-sm text-slate-500">Gestionează-ți facturile și filtrează-le rapid.</p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200">
          <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Caută facturi..."
            class="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </label>

        <div
          class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
        >
          <CalendarDaysIcon class="h-5 w-5 text-slate-400" />
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="option in dateRangeOptions"
              :key="option.value"
              type="button"
              class="rounded-lg px-3 py-1 text-xs font-semibold transition"
              :class="
                option.value === dateRange
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
              "
              @click="dateRange = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
          <FunnelIcon class="h-5 w-5 text-slate-400" />
          <select
            v-model="statusFilter"
            class="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">Toate statusurile</option>
            <option value="paid">Plătite</option>
            <option value="unpaid">Neplătite</option>
          </select>
        </div>

        <button
          type="button"
          class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
          @click="toggleSort"
        >
          <span>Sortează: {{ sortLabel }}</span>
          <ArrowsUpDownIcon class="h-5 w-5" />
        </button>
      </div>
    </section>

    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              :checked="areAllVisibleSelected"
              @change="toggleSelectAll"
            />
            Selectează tot ({{ filteredInvoices.length }} facturi)
          </label>
        </div>
        <div class="text-sm text-slate-500">
          Facturi selectate: <span class="font-semibold text-slate-900">{{ selectedInvoices.length }}</span>
          ({{ formatCurrency(selectedTotal) }})
        </div>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead>
            <tr class="text-xs uppercase tracking-wide text-slate-500">
              <th class="px-4 py-3 font-medium">Selectează</th>
              <th class="px-4 py-3 font-medium">Număr Factură</th>
              <th class="px-4 py-3 font-medium">Data Emiterii</th>
              <th class="px-4 py-3 font-medium">Valoare Totală</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Data Scadență</th>
              <th class="px-4 py-3 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-600">
            <tr v-if="isLoading" class="transition">
              <td colspan="7" class="px-4 py-6 text-center text-sm text-slate-500">
                <div class="flex items-center justify-center gap-3">
                  <svg
                    class="h-5 w-5 animate-spin text-emerald-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Se încarcă facturile...</span>
                </div>
              </td>
            </tr>
            <template v-else>
              <template v-if="filteredInvoices.length === 0">
                <tr class="transition">
                  <td colspan="7" class="px-4 py-6 text-center text-sm text-slate-500">
                    Nu există facturi care să corespundă filtrării curente.
                  </td>
                </tr>
              </template>
              <tr
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="transition hover:bg-emerald-50/50"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    :checked="selectedInvoices.includes(invoice.id)"
                    @change="toggleInvoice(invoice.id)"
                  />
                </td>
                <td class="px-4 py-3 font-semibold text-slate-900">{{ invoice.number }}</td>
                <td class="px-4 py-3">{{ formatDate(invoice.issueDate) }}</td>
                <td class="px-4 py-3 font-semibold text-slate-900">{{ formatCurrency(invoice.amount) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                    :class="statusClasses(statusMeta(invoice.status).tone)"
                  >
                    <span class="h-2 w-2 rounded-full" :class="dotClasses(statusMeta(invoice.status).tone)"></span>
                    {{ statusMeta(invoice.status).label }}
                  </span>
                </td>
                <td class="px-4 py-3">{{ formatDate(invoice.dueDate) }}</td>
                <td class="px-4 py-3 text-right">
                  <RouterLink
                    :to="`/invoices/${invoice.id}/pay`"
                    class="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                  >
                    Plătește
                    <ArrowRightIcon class="h-4 w-4" />
                  </RouterLink>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex flex-col gap-4 rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Facturi selectate: <span class="font-semibold">{{ selectedInvoices.length }}</span>
          — Total de plată: <span class="font-semibold">{{ formatCurrency(selectedTotal) }}</span>
        </div>
        <RouterLink
          :to="payLink"
          class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-200"
          :class="{ 'opacity-50': selectedInvoices.length === 0 }"
        >
          <CheckCircleIcon class="h-5 w-5" />
          Plătește facturile selectate
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowRightIcon,
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CreditCardIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate, statusMeta } from '@/utils/formatters'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref('all')
const dateRange = ref('all')
const sortField = ref('issueDate')
const selectedInvoices = ref([])

const dateRangeOptions = [
  { label: '60 zile', value: '60' },
  { label: 'Toate', value: 'all' }
]

const allowedStatuses = ['all', 'paid', 'unpaid']
const allowedRanges = ['60', 'all']
const allowedSorts = ['issueDate', 'amount']

const allInvoices = computed(() => authStore.invoices)

const filteredInvoices = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  const range = dateRange.value
  let rangeStart = null

  if (range !== 'all') {
    const days = Number.parseInt(range, 10)
    if (Number.isFinite(days)) {
      rangeStart = new Date()
      rangeStart.setHours(0, 0, 0, 0)
      rangeStart.setDate(rangeStart.getDate() - (days - 1))
    }
  }

  return allInvoices.value
    .filter((invoice) => {
      const matchesSearch =
        !search ||
        invoice.number.toLowerCase().includes(search) ||
        formatDate(invoice.issueDate).toLowerCase().includes(search)

      const matchesStatus = statusFilter.value === 'all' || invoice.status === statusFilter.value

      let matchesRange = true
      if (rangeStart) {
        const issueDate = new Date(invoice.issueDate)
        matchesRange = !Number.isNaN(issueDate.getTime()) && issueDate >= rangeStart
      }

      return matchesSearch && matchesStatus && matchesRange
    })
    .sort((a, b) => {
      if (sortField.value === 'amount') {
        return b.amount - a.amount
      }

      const dateA = new Date(a.issueDate)
      const dateB = new Date(b.issueDate)

      return Number.isNaN(dateB.getTime()) || Number.isNaN(dateA.getTime())
        ? 0
        : dateB.getTime() - dateA.getTime()
    })
})

const selectedTotal = computed(() =>
  selectedInvoices.value.reduce((total, invoiceId) => {
    const invoice = allInvoices.value.find((item) => item.id === invoiceId)
    return invoice ? total + invoice.amount : total
  }, 0)
)

const payLink = computed(() => {
  if (selectedInvoices.value.length === 0) {
    return { path: '/pay' }
  }

  return {
    path: '/pay',
    query: { invoices: selectedInvoices.value.join(',') }
  }
})

const sortLabel = computed(() => (sortField.value === 'amount' ? 'Valoare' : 'Dată factură'))
const areAllVisibleSelected = computed(
  () => filteredInvoices.value.length > 0 && filteredInvoices.value.every((invoice) => selectedInvoices.value.includes(invoice.id))
)

const isLoading = computed(() => authStore.isLoading)

onMounted(() => {
  if (!authStore.invoices.length) {
    authStore.refreshInvoices().catch(() => {
      // erorile sunt gestionate în store
    })
  }
})

let isSyncingFromRoute = false

watch(
  () => route.query,
  (query) => {
    isSyncingFromRoute = true

    const normalizedStatus = allowedStatuses.includes(query.status)
      ? query.status
      : 'all'
    const normalizedRange = allowedRanges.includes(query.range)
      ? query.range
      : 'all'
    const normalizedSort = allowedSorts.includes(query.sort)
      ? query.sort
      : 'issueDate'

    searchTerm.value = query.search?.toString() ?? ''
    statusFilter.value = normalizedStatus
    dateRange.value = normalizedRange
    sortField.value = normalizedSort

    isSyncingFromRoute = false
  },
  { immediate: true }
)

watch(
  [searchTerm, statusFilter, dateRange, sortField],
  () => {
    if (isSyncingFromRoute) {
      return
    }

    const nextQuery = {}

    if (searchTerm.value.trim()) {
      nextQuery.search = searchTerm.value.trim()
    }

    if (statusFilter.value !== 'all') {
      nextQuery.status = statusFilter.value
    }

    if (dateRange.value !== '30') {
      nextQuery.range = dateRange.value
    }

    if (sortField.value !== 'issueDate') {
      nextQuery.sort = sortField.value
    }

    const currentQuery = querySnapshot()
    if (isEqualQueries(currentQuery, nextQuery)) {
      return
    }

    router.replace({ query: nextQuery }).catch(() => {})
  }
)

watch(allInvoices, () => {
  selectedInvoices.value = selectedInvoices.value.filter((id) => allInvoices.value.some((invoice) => invoice.id === id))
})

function toggleSort() {
  sortField.value = sortField.value === 'amount' ? 'issueDate' : 'amount'
}

function toggleInvoice(id) {
  if (selectedInvoices.value.includes(id)) {
    selectedInvoices.value = selectedInvoices.value.filter((invoiceId) => invoiceId !== id)
  } else {
    selectedInvoices.value = [...selectedInvoices.value, id]
  }
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedInvoices.value = filteredInvoices.value.map((invoice) => invoice.id)
  } else {
    selectedInvoices.value = []
  }
}

function querySnapshot() {
  const snapshot = {}

  if (route.query.search) {
    snapshot.search = route.query.search.toString()
  }

  if (route.query.status && route.query.status !== 'all') {
    snapshot.status = route.query.status
  }

  if (route.query.range && route.query.range !== '30') {
    snapshot.range = route.query.range
  }

  if (route.query.sort && route.query.sort !== 'issueDate') {
    snapshot.sort = route.query.sort
  }

  return snapshot
}

function isEqualQueries(a, b) {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  return keysA.every((key) => a[key] === b[key])
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
