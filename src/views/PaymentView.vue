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

        <form class="flex-1 space-y-4" @submit.prevent="submitPayment">
          <h2 class="text-lg font-semibold text-slate-900">Introdu detalii card</h2>
          <p class="text-sm text-slate-500">Completează datele cardului pentru a confirma plata facturii.</p>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="text-sm font-medium text-slate-600" for="card-name">Numele titularului cardului</label>
              <input
                id="card-name"
                v-model="form.cardName"
                type="text"
                required
                placeholder="Numele titularului cardului"
                class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="text-sm font-medium text-slate-600" for="card-number">Număr card</label>
              <input
                id="card-number"
                v-model="form.cardNumber"
                type="text"
                inputmode="numeric"
                required
                placeholder="XXXX XXXX XXXX XXXX"
                class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-600" for="expiry">Data expirării</label>
              <input
                id="expiry"
                v-model="form.expiry"
                type="text"
                inputmode="numeric"
                required
                placeholder="MM/AA"
                class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-600" for="cvv">CVV</label>
              <input
                id="cvv"
                v-model="form.cvv"
                type="password"
                inputmode="numeric"
                maxlength="4"
                required
                placeholder="XXX"
                class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <p class="text-xs text-slate-500">
            Datele cardului sunt stocate în siguranță de către partenerii noștri, conform politicii de confidențialitate.
          </p>

          <button
            type="submit"
            class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Confirmă plata
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { invoices } from '@/data/invoices'
import { formatCurrency, formatDate, statusMeta } from '@/utils/formatters'

const route = useRoute()
const form = reactive({
  cardName: 'Client Premium',
  cardNumber: 'XXXX XXXX XXXX XXXX',
  expiry: '',
  cvv: ''
})

const currentInvoice = computed(() => {
  const invoiceId = route.params.id
  return invoices.find((invoice) => invoice.id === invoiceId) ?? invoices[0]
})

function submitPayment() {
  window.alert(
    `Plata pentru factura ${currentInvoice.value.number} în valoare de ${formatCurrency(currentInvoice.value.amount)} a fost trimisă.`
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
