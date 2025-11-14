<template>
  <div class="space-y-6 animate-fade-slide">
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 animate-fade-slide">
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-sm text-emerald-700 animate-fade-slide"
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
        class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 animate-fade-slide"
        style="animation-delay: .1s"
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
        class="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-sm text-amber-700 animate-fade-slide"
        style="animation-delay: .2s"
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

      <div v-else class="flex flex-col gap-6 lg:flex-row animate-fade-slide" style="animation-delay: .1s">
        <div class="flex-1 space-y-5">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Facturi selectate</h2>
            <p class="mt-1 text-sm text-slate-500">
              Ai selectat {{ selectedCount }} {{ selectedCount === 1 ? 'factură' : 'facturi' }} pentru plată.
            </p>
          </div>

          <div
            v-if="errorMessage"
            class="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700 animate-fade-slide"
          >
            {{ errorMessage }}
          </div>

          <ul class="space-y-4 list-none p-0 m-0">
            <li
              v-for="(invoice, index) in selectedInvoices"
              :key="invoice.id"
              class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-slide"
              :style="{ animationDelay: `${index * 70}ms` }"
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
                  v-if="invoice.status === 'unpaid'"
                  :to="`/pay/${invoice.id}`"
                  class="inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  Plateste doar aceasta factură
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

        <div
          class="w-full max-w-sm space-y-5 rounded-2xl border border-slate-100 p-6 animate-fade-slide
                sticky top-20 self-start bg-white z-10"
          style="animation-delay: .2s"
          v-if="selectedTotal > 0"
        >
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
            class="w-full rounded-xl bg-emerald-600 px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            :disabled="isProcessingPayment || !selectedInvoices.length"
            @click="startExternalPayment"
          >
            <span v-if="isProcessingPayment" class="flex items-center justify-center gap-2">
              <svg
                class="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Se inițiază plata...
            </span>
            <span v-else>Continuă către plata securizată</span>
          </button>

          <p class="text-xs text-slate-400">
            După finalizarea plății vei fi redirecționat înapoi pentru confirmarea tranzacției.
          </p>
        </div>
        <div
          v-else
          class="w-full max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center text-sm text-emerald-700 shadow-sm animate-fade-slide"
          style="animation-delay: .2s"
        >
          <h2 class="text-lg font-semibold text-emerald-800">Plata efectuata cu succes</h2>
          <p class="mt-2 text-emerald-700">
            Toate facturile selectate au fost achitate deja.
          </p>

          <div class="mt-4 flex justify-center">
            <RouterLink
              to="/invoices"
              class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Vezi lista de facturi
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
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api, { getErrorMessage } from '@/utils/api'
import { formatCurrency, formatDate, statusMeta } from '@/utils/formatters'
import Swal from 'sweetalert2'

const route = useRoute()
const authStore = useAuthStore()

const selectedInvoices = ref([])
const isLoading = ref(false)
const errorMessage = ref(null)
const isProcessingPayment = ref(false)

let paymentWindowInstance = null
let paymentWindowOpen = false
let paymentStatusTimeout = null
let paymentFailsafeTimeout = null
let shouldPollPaymentStatus = false

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

onBeforeUnmount(() => {
  cleanupPaymentWindow()
})

function generatePaymentToken() {
  const randomPart = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  const timestamp = Date.now().toString(36)
  return `payment-${randomPart}-${timestamp}`
}

function cleanupPaymentWindow() {
  if (paymentStatusTimeout) {
    clearTimeout(paymentStatusTimeout)
    paymentStatusTimeout = null
  }

  if (paymentFailsafeTimeout) {
    clearTimeout(paymentFailsafeTimeout)
    paymentFailsafeTimeout = null
  }

  shouldPollPaymentStatus = false

  paymentWindowOpen = false
  paymentWindowInstance = null
}

function openPaymentLink(url) {
  return openPaymentLinkInline(url);

  if (paymentWindowOpen) {
    Swal.fire({
      title: "Plată deja în curs",
      html: `
        Există deja o plată în desfășurare.<br><br>
        <button id="cancel-payment" class="swal2-confirm swal2-styled" style="background:#dc2626">
          Anulează plata curentă
        </button>
      `,
      icon: "warning",
      showConfirmButton: false,
      didRender: () => {
        document.getElementById("cancel-payment").onclick = () => {
          cleanupPaymentWindow()
          Swal.close()
        }
      }
    })
    return false
  }

  // Mark flow as started
  paymentWindowOpen = true

  // 🔥 1. Open the real payment page immediately (user action → not blocked)
  window.open(url, "_blank")

  // 🔥 2. Then show the "ongoing payment" modal
  Swal.fire({
    title: "Plată în desfășurare",
    html: `
      Pagina de plată a fost deschisă într-o filă nouă.<br>
      Finalizează plata și vom verifica automat statusul tranzacției.<br><br>

      <button id="cancel-payment" class="swal2-cancel swal2-styled" style="background:#dc2626">
        Anulează plata
      </button>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    didRender: () => {
      document.getElementById("cancel-payment").onclick = () => {
        cleanupPaymentWindow()
        Swal.fire({
          title: "Plata a fost anulată",
          icon: "info",
          confirmButtonColor: "#059669"
        })
      }
    }
  })

  return true
}

function openPaymentLinkInline(url) {
  if (paymentWindowOpen) {
    Swal.fire({
      title: "Plată deja în curs",
      html: `
        Există deja o plată în desfășurare.<br><br>
        <button id="cancel-payment" 
                class="swal2-confirm swal2-styled" 
                style="background:#dc2626">
          Anulează plata curentă
        </button>
      `,
      icon: "warning",
      showConfirmButton: false,
      didRender: () => {
        document.getElementById("cancel-payment").onclick = () => {
          cleanupPaymentWindow()
          Swal.close()
        }
      }
    })
    return false
  }

  // mark flow started
  paymentWindowOpen = true

  // SweetAlert2 beautiful embedded iframe popup
  Swal.fire({
    title: "Finalizează plata",
    width: "70%",
    padding: "0",
    background: "#f9fafb",
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: "rounded-2xl shadow-xl overflow-hidden"
    },
    html: `
      <div style="
        display:flex;
        flex-direction:column;
        height:80vh;
        max-height:800px;
      ">
        <iframe 
          src="${url}" 
          style="
            flex:1;
            width:100%;
            border:0;
            background:white;
          "
          allow="payment *; fullscreen"
        ></iframe>

        <div style="
          padding:12px;
          background:#f1f5f9;
          border-top:1px solid #e2e8f0;
          text-align:right;
        ">
          <button id="cancel-payment" 
                  style="
                    background:#dc2626;
                    color:white;
                    border:none;
                    padding:10px 18px;
                    border-radius:8px;
                    font-size:14px;
                    cursor:pointer;
                  ">
            Anulează plata
          </button>
        </div>
      </div>
    `,
    didRender: () => {
      document.getElementById("cancel-payment").onclick = () => {
        cleanupPaymentWindow()
        Swal.close()

        Swal.fire({
          title: "Plata a fost anulată",
          icon: "info",
          confirmButtonColor: "#059669"
        })
      }
    }
  })

  return true
}

function scheduleHashCheck(token, callback) {
  if (!shouldPollPaymentStatus) {
    return
  }

  paymentStatusTimeout = window.setTimeout(async () => {
    try {
      const { data } = await api.post('/check-hash', { token })
      const response = data?.res ?? data?.data ?? data

      if (!response) {
        if (paymentWindowOpen) {
          scheduleHashCheck(token, callback)
        } else {
          callback(false)
        }
        return
      }

      const tranStatus = response.tran_status ?? response.status

      if (tranStatus === '-1' || tranStatus === '' || tranStatus === 'pending') {
        if (paymentWindowOpen) {
          scheduleHashCheck(token, callback)
        } else {
          callback(false)
        }
        return
      }

      callback(response)
    } catch (error) {
      if (paymentWindowOpen) {
        scheduleHashCheck(token, callback)
      } else {
        callback(false)
      }
    }
  }, 1000)
}

function startHashCheck(token, callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  shouldPollPaymentStatus = true
  scheduleHashCheck(token, (status) => {
    shouldPollPaymentStatus = false
    if (paymentStatusTimeout) {
      clearTimeout(paymentStatusTimeout)
      paymentStatusTimeout = null
    }
    callback(status)
  })

  return () => {
    shouldPollPaymentStatus = false
    if (paymentStatusTimeout) {
      clearTimeout(paymentStatusTimeout)
      paymentStatusTimeout = null
    }
  }
}

function startExternalPayment() {
  if (!selectedInvoices.value.length) {
    errorMessage.value = 'Selectează cel puțin o factură înainte de a continua plata.'
    return
  }

  const invoiceNumbers = selectedInvoices.value.map((invoice) => invoice.number).join(', ')

  Swal.fire({
    title: 'Continuă către plata securizată',
    html:
      selectedInvoices.value.length === 1
        ? `Vei fi redirecționat către pagina securizată pentru plata facturii <strong>${invoiceNumbers}</strong> în valoare de <strong>${formatCurrency(
            selectedTotal.value
          )}</strong>.`
        : `Vei fi redirecționat către pagina securizată pentru plata a <strong>${selectedInvoices.value.length}</strong> facturi ( ${invoiceNumbers} ) în valoare totală de <strong>${formatCurrency(
            selectedTotal.value
          )}</strong>.`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Continuă',
    cancelButtonText: 'Renunță',
    confirmButtonColor: '#059669',
    background: '#f8fafc',
    color: '#0f172a'
  }).then(async (result) => {
    if (!result.isConfirmed) {
      Swal.fire({
        title: 'Acțiune anulată',
        text: 'Nu ai inițiat plata facturilor selectate.',
        icon: 'info',
        confirmButtonColor: '#059669'
      })
      return
    }

    const token = generatePaymentToken()
    const payload = {
      token,
      customer_id: authStore.customer?.id ?? null,
      invoices: selectedInvoices.value.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount: Number.parseFloat(invoice.balance ?? invoice.amount) || 0
      })),
      amount: Number.parseFloat(selectedTotal.value.toFixed(2)),
      currency: 'RON',
      order_desc:
        selectedInvoices.value.length === 1
          ? `Plată factură ${invoiceNumbers}`
          : `Plată facturi ${invoiceNumbers}`
    }

    isProcessingPayment.value = true
    errorMessage.value = null

    try {
      const { data } = await api.post('/fp-hash', payload)
      const response = data?.res ?? data?.data ?? data

      const paymentUrl = response?.payment_url ?? response?.paymentUrl
      if (!paymentUrl) {
        throw new Error('Nu am primit linkul de plată de la server.')
      }

      const opened = openPaymentLink(paymentUrl)
      if (!opened) {
        return
      }

      if (typeof window !== 'undefined') {
        if (paymentFailsafeTimeout) {
          clearTimeout(paymentFailsafeTimeout)
        }

        paymentFailsafeTimeout = window.setTimeout(() => {
          cleanupPaymentWindow()
        }, 1000 * 60 * 5 + 10)
      }

      startHashCheck(token, async (status) => {
        cleanupPaymentWindow()

        if (status === false) {
          Swal.fire({
            title: 'Plata a fost anulată',
            text: 'Nu am confirmarea plății. Dacă ai finalizat totuși plata, contactează-ne.',
            icon: 'error',
            confirmButtonColor: '#059669'
          })
          return
        }

        const tranStatus = status.tran_status ?? status.status
        const tranMessage = status.tran_message ?? status.message ?? ''

        if (tranStatus === '0' || tranStatus === true || tranStatus === 'approved') {
          await authStore.refreshInvoices().catch(() => {
            // erorile sunt gestionate în store
          })

          Swal.fire({
            title: 'Plata a fost efectuată cu succes',
            text: 'Facturile selectate au fost marcate ca plătite.',
            icon: 'success',
            confirmButtonColor: '#059669'
          })
          return
        }

        Swal.fire({
          title: 'Plata nu a fost finalizată',
          html:
            tranMessage
              ? `Procesatorul de plăți a returnat mesajul: <strong>${tranMessage}</strong>. Încearcă din nou sau contactează suportul nostru.`
              : 'Procesatorul de plăți nu a confirmat tranzacția. Încearcă din nou sau contactează suportul nostru.',
          icon: 'error',
          confirmButtonColor: '#059669'
        })
      })
    } catch (error) {
      cleanupPaymentWindow()
      errorMessage.value = getErrorMessage(error, 'A apărut o eroare la inițierea plății. Încearcă din nou.')
      Swal.fire({
        title: 'Eroare',
        text: errorMessage.value,
        icon: 'error',
        confirmButtonColor: '#059669'
      })
    } finally {
      isProcessingPayment.value = false
    }
  })
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
