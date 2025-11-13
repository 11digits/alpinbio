<template>
  <div class="space-y-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Listă Facturi</h1>
          <p class="text-sm text-slate-500">Gestionează-ți facturile și filtrează-le rapid.</p>
        </div>
        <RouterLink
          to="/pay"
          class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          Plătește facturi
          <CreditCardIcon class="h-5 w-5" />
        </RouterLink>
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

        <button
          type="button"
          class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
        >
          <span>Perioadă: ultimele 30 zile</span>
          <CalendarDaysIcon class="h-5 w-5" />
        </button>

        <div class="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
          <FunnelIcon class="h-5 w-5 text-slate-400" />
          <select
            v-model="statusFilter"
            class="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">Toate statusurile</option>
            <option value="paid">Plătite</option>
            <option value="due">Scadente curând</option>
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
                Se încarcă facturile...
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
          to="/pay"
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
import { RouterLink } from 'vue-router'
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

const searchTerm = ref('')
const statusFilter = ref('all')
const sortField = ref('dueDate')
const selectedInvoices = ref([])

const allInvoices = computed(() => authStore.invoices)

const filteredInvoices = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()

  return allInvoices.value
    .filter((invoice) => {
      const matchesSearch =
        !search ||
        invoice.number.toLowerCase().includes(search) ||
        formatDate(invoice.issueDate).toLowerCase().includes(search)

      const matchesStatus = statusFilter.value === 'all' || invoice.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortField.value === 'amount') {
        return b.amount - a.amount
      }

      return new Date(a.dueDate) - new Date(b.dueDate)
    })
})

const selectedTotal = computed(() =>
  selectedInvoices.value.reduce((total, invoiceId) => {
    const invoice = allInvoices.value.find((item) => item.id === invoiceId)
    return invoice ? total + invoice.amount : total
  }, 0)
)

const sortLabel = computed(() => (sortField.value === 'amount' ? 'Valoare' : 'Dată scadență'))
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

watch(allInvoices, () => {
  selectedInvoices.value = selectedInvoices.value.filter((id) => allInvoices.value.some((invoice) => invoice.id === id))
})

function toggleSort() {
  sortField.value = sortField.value === 'amount' ? 'dueDate' : 'amount'
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
