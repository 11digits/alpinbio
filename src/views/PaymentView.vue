<template>
  <div class="space-y-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-col gap-6 lg:flex-row">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { invoices } from '@/data/invoices'
import { formatCurrency, formatDate, statusMeta } from '@/utils/formatters'

const route = useRoute()

const currentInvoice = computed(() => {
  const invoiceId = route.params.id
  return invoices.find((invoice) => invoice.id === invoiceId) ?? invoices[0]
})

function startExternalPayment() {
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
