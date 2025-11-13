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
        <span>Se încarcă detaliile facturii selectate...</span>
      </div>
      <div v-else-if="errorMessage" class="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
        <p>{{ errorMessage }}</p>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          @click="loadInvoice(defaultInvoiceId)"
        >
          Reîncearcă încărcarea facturii
        </button>
      </div>
      <div
        v-else-if="!currentInvoice"
        class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        <p v-if="authStore.invoices.length === 0">
          Nu există facturi disponibile pentru plată în acest moment.
        </p>
        <template v-else>
          <p>Selectează facturile pentru plată din secțiunea „Listă Facturi”.</p>
          <RouterLink
            to="/invoices"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
          >
            Mergi la facturi
          </RouterLink>
        </template>
      </div>
      <div v-else class="flex flex-col gap-6 lg:flex-row">
        <div class="flex-1 rounded-2xl bg-slate-50 p-6">
          <h2 class="text-lg font-semibold text-slate-900">Detalii Factură</h2>
          <dl class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="flex items-center justify-between">
              <dt class="font-medium text-slate-500">Număr Factură</dt>
              <dd class="font-semibold text-slate-900">{{ currentInvoice.number }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-medium text-slate-500">Data emiterii</dt>
              <dd>{{ formatDate(currentInvoice.issueDate) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-medium text-slate-500">Data scadenței</dt>
              <dd>{{ formatDate(currentInvoice.dueDate) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-medium text-slate-500">Status</dt>
              <dd>
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusClasses(statusMeta(currentInvoice.status).tone)"
                >
                  <span class="h-2 w-2 rounded-full" :class="dotClasses(statusMeta(currentInvoice.status).tone)"></span>
                  {{ statusMeta(currentInvoice.status).label }}
                </span>
              </dd>
            </div>
          </dl>

          <div class="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <p class="text-sm font-semibold text-slate-500">Total de plată</p>
            <p class="mt-1 text-3xl font-bold text-slate-900">{{ formatCurrency(currentInvoice.amount) }}</p>
            <p class="mt-2 text-sm text-slate-500">Plata securizată prin partenerii Alpin Bio Solution.</p>
          </div>
        </div>

        <div class="flex-1 space-y-5 rounded-2xl border border-slate-100 p-6">
          <h2 class="text-lg font-semibold text-slate-900">Plată externă securizată</h2>
          <p class="text-sm text-slate-500">
            Pentru a finaliza plata, vei fi redirecționat către pagina securizată a procesatorului nostru. După confirmare,
            statusul facturii se va actualiza automat.
          </p>

          <ul class="space-y-3 text-sm text-slate-600">
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-emerald-400"></span>
              <span>Verifică detaliile facturii înainte de a continua către plata online.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-emerald-400"></span>
              <span>Vei primi confirmarea plății pe e-mail imediat după finalizarea tranzacției.</span>
            </li>
          </ul>

          <button
            type="button"
            class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            @click="startExternalPayment"
          >
            Continuă către plata securizată
          </button>

          <p class="text-xs text-slate-400">
            După finalizarea plății, vei fi redirecționat înapoi pentru a vedea confirmarea tranzacției.
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

const invoice = ref(null)
const isLoading = ref(false)
const errorMessage = ref(null)

const defaultInvoiceId = computed(() => {
  if (route.params.id) {
    return route.params.id
  }

  const unpaid = authStore.invoices.find((item) => item.status !== 'paid')
  return unpaid?.id ?? authStore.invoices[0]?.id ?? authStore.activeInvoice?.id ?? null
})

const currentInvoice = computed(() => {
  if (invoice.value) {
    return invoice.value
  }

  const fromStore = authStore.invoices.find(
    (item) => item.id === defaultInvoiceId.value || item.number === defaultInvoiceId.value
  )

  return fromStore ?? authStore.activeInvoice ?? null
})

async function loadInvoice(id) {
  if (!id) {
    invoice.value = null
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const data = await authStore.fetchInvoice(id)
    invoice.value = data
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Factura selectată nu a putut fi încărcată.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!authStore.invoices.length) {
    await authStore.refreshInvoices().catch(() => {
      // erorile sunt gestionate în store
    })
  }

  await loadInvoice(defaultInvoiceId.value)
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadInvoice(newId)
    } else if (defaultInvoiceId.value) {
      await loadInvoice(defaultInvoiceId.value)
    }
  }
)

function startExternalPayment() {
  if (!currentInvoice.value) {
    errorMessage.value = 'Selectează o factură înainte de a continua plata.'
    return
  }

  window.alert(
    `Vei fi redirecționat către pagina securizată pentru plata facturii ${currentInvoice.value.number} în valoare de ${formatCurrency(currentInvoice.value.amount)}.`
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
