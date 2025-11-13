<template>
  <div class="space-y-6">
    <section class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div class="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white shadow-xl">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-wide text-emerald-100">Bun venit, {{ welcomeName }}!</p>
            <h2 class="mt-1 text-3xl font-semibold">Sold curent</h2>
            <p class="mt-2 text-4xl font-bold">{{ formatCurrency(availableBalance) }}</p>
          </div>
          <div class="rounded-2xl bg-white/10 px-4 py-3 text-sm text-emerald-50">
            <p class="font-semibold">Status cont</p>
            <p class="mt-1 flex items-center gap-2 text-emerald-100">
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-200"></span>
              Actualizat {{ lastUpdateLabel }}
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <RouterLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/20"
          >
            <div>
              <p class="text-emerald-100">
                {{ action.label }}
                <span
                  v-if="action.showCount && unpaidInvoicesCount"
                  class="font-semibold text-white"
                >
                  ({{ unpaidInvoicesCount }})
                </span>
              </p>
              <p class="text-lg font-semibold text-white">{{ action.cta }}</p>
            </div>
            <component :is="action.icon" class="h-6 w-6 text-emerald-100" />
          </RouterLink>
        </div>
      </div>

      <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h3 class="text-lg font-semibold text-slate-900">Servicii rapide</h3>
        <p class="mt-1 text-sm text-slate-500">Ultimele actualizări {{ lastUpdateLabel }}</p>

        <ul class="mt-4 space-y-3">
          <li
            v-for="service in quickServices"
            :key="service.label"
            class="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <component :is="service.icon" class="mt-1 h-6 w-6 text-emerald-500" />
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-900">
                {{ service.label }}
                <span
                  v-if="service.showCount && unpaidInvoicesCount"
                  class="font-semibold text-emerald-600"
                >
                  ({{ unpaidInvoicesCount }})
                </span>
              </p>
              <p class="text-sm text-slate-500">{{ service.description }}</p>
            </div>
            <RouterLink :to="service.to" class="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              {{ service.cta }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Ultimele Facturi</h3>
          <p class="text-sm text-slate-500">Monitorizează plățile recente și scadente</p>
        </div>
        <RouterLink
          to="/invoices"
          class="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
        >
          Vezi toate facturile
          <ArrowRightIcon class="h-4 w-4" />
        </RouterLink>
      </div>

      <div class="mt-6 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead>
            <tr class="text-xs uppercase tracking-wide text-slate-500">
              <th class="px-4 py-3 font-medium">Număr Factură</th>
              <th class="px-4 py-3 font-medium">Data Emiterii</th>
              <th class="px-4 py-3 font-medium">Valoare</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Scadență</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-600">
            <tr v-for="invoice in latestInvoices" :key="invoice.id" class="transition hover:bg-emerald-50/40">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ invoice.number }}</td>
              <td class="px-4 py-3">{{ formatDate(invoice.issueDate) }}</td>
              <td class="px-4 py-3 font-semibold text-slate-900">{{ formatCurrency(invoice.amount) }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusClasses(statusMeta(invoice.status).tone)"
                >
                  <span class="h-2 w-2 rounded-full" :class="dotClasses(statusMeta(invoice.status).tone)"></span>
                  {{ statusMeta(invoice.status).label }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatDate(invoice.dueDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRightIcon, DocumentTextIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate, statusMeta } from '@/utils/formatters'

const authStore = useAuthStore()

const dateTimeFormatter = new Intl.DateTimeFormat('ro-RO', {
  dateStyle: 'long',
  timeStyle: 'short'
})

const quickActions = computed(() => [
  { label: 'Facturile mele', cta: 'Vezi toate', to: '/invoices', icon: DocumentTextIcon, showCount: true },
  { 
    label: 'Efectuează o plată', 
    cta: 'Plătește acum', 
    to: { path: '/invoices', query: { status: 'unpaid' } },
    icon: CreditCardIcon 
  },
  {
    label: 'Istoric tranzacții',
    cta: 'Vezi detalii',
    to: { path: '/invoices', query: { status: 'paid' } },
    icon: ChartBarIcon
  }
])

const quickServices = computed(() => [
  {
    label: 'Facturile mele',
    description: 'Vizualizează toate facturile și istoricul plăților',
    cta: 'Vezi facturile',
    icon: DocumentTextIcon,
    to: { path: '/invoices', query: { status: 'all' } },
    showCount: true
  },
  {
    label: 'Efectuează o plată',
    description: 'Plătește facturile rapid și sigur în câteva secunde',
    cta: 'Plătește acum',
    icon: CreditCardIcon,
    to: { path: '/invoices', query: { status: 'unpaid' } },
  }
])

const welcomeName = computed(() => {
  const fullName = authStore.customer?.name?.trim()
  if (!fullName) {
    return 'client'
  }

  const [first] = fullName.split(/\s+/)
  if (!first) {
    return 'client'
  }

  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
})

const availableBalance = computed(() => authStore.outstandingBalance)

const unpaidInvoicesCount = computed(() =>
  authStore.invoices.filter((invoice) => invoice.status !== 'paid').length
)

const latestInvoices = computed(() =>
  [...authStore.invoices]
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    .slice(0, 6)
)

const lastUpdateLabel = computed(() => {
  if (!authStore.lastSyncedAt) {
    return 'recent'
  }

  const date = new Date(authStore.lastSyncedAt)
  if (Number.isNaN(date.getTime())) {
    return 'recent'
  }

  return `la ${dateTimeFormatter.format(date)}`
})

onMounted(() => {
  if (!authStore.invoices.length) {
    authStore.refreshInvoices().catch(() => {
      // erorile sunt gestionate în store
    })
  }
})

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
