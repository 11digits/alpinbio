<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-12">
    <div class="w-full max-w-lg rounded-3xl bg-white p-8 shadow-lg ring-1 ring-emerald-100">
      <div class="mb-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white text-xl font-semibold">
          AB
        </div>
        <h1 class="mt-4 text-2xl font-semibold text-slate-900">Autentificare</h1>
        <p class="mt-2 text-sm text-slate-500">Introduceți detaliile pentru a accesa facturile și plățile.</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="text-sm font-medium text-slate-600" for="invoice">Număr factură</label>
          <div class="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              id="invoice"
              v-model="form.invoiceNumber"
              type="text"
              :disabled="authStore.isLoading || hasVerifiedInvoice"
              required
              placeholder="Introduceți numărul facturii"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
            />
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              :disabled="!form.invoiceNumber || authStore.isLoading || hasVerifiedInvoice"
              @click="lookupInvoice"
            >
              Verifică factura
            </button>
          </div>
          <p v-if="authStore.invoiceError" class="mt-2 text-sm text-rose-600">{{ authStore.invoiceError }}</p>
        </div>

        <div v-if="hasVerifiedInvoice" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>
            Factura aparține clientului
            <span class="font-semibold">{{ authStore.maskedCustomerName }}</span>.
          </p>
          <p class="mt-1">Completează numele complet pentru a continua autentificarea.</p>
          <button
            type="button"
            class="mt-2 text-xs font-semibold text-emerald-700 underline decoration-dotted hover:text-emerald-800"
            @click="resetInvoice"
          >
            Schimbă factura introdusă
          </button>
        </div>

        <div v-if="hasVerifiedInvoice">
          <label class="text-sm font-medium text-slate-600" for="full-name">Nume complet</label>
          <input
            id="full-name"
            v-model="form.fullName"
            type="text"
            :disabled="authStore.isLoading"
            required
            placeholder="Scrie numele complet exact ca pe factură"
            class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
          />
          <p v-if="authStore.verificationError" class="mt-2 text-sm text-rose-600">{{ authStore.verificationError }}</p>
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-200"
          :disabled="authStore.isLoading || !canSubmit"
        >
          {{ hasVerifiedInvoice ? 'Autentificare' : 'Verifică factura' }}
        </button>
      </form>

      <div class="mt-8 flex flex-col gap-1 text-center text-xs text-slate-400">
        <a href="#" class="hover:text-emerald-600">Politica de confidențialitate</a>
        <a href="#" class="hover:text-emerald-600">Termeni și condiții</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  invoiceNumber: authStore.invoiceNumber ?? '',
  fullName: ''
})

const hasVerifiedInvoice = computed(() => Boolean(authStore.customer))
const canSubmit = computed(() => {
  if (!hasVerifiedInvoice.value) {
    return Boolean(form.invoiceNumber)
  }

  return Boolean(form.fullName.trim())
})

watch(
  () => authStore.invoiceNumber,
  (value) => {
    if (value && !form.invoiceNumber) {
      form.invoiceNumber = value
    }
  },
  { immediate: true }
)

watch(
  () => form.invoiceNumber,
  () => {
    if (authStore.invoiceError) {
      authStore.invoiceError = null
    }
  }
)

watch(
  () => form.fullName,
  () => {
    if (authStore.verificationError) {
      authStore.verificationError = null
    }
  }
)

async function lookupInvoice() {
  if (!form.invoiceNumber) {
    return
  }

  const success = await authStore.lookupInvoice(form.invoiceNumber)
  if (success) {
    form.fullName = ''
  }
}

async function handleSubmit() {
  if (!hasVerifiedInvoice.value) {
    await lookupInvoice()
    return
  }

  if (authStore.verifyCustomerName(form.fullName)) {
    await authStore.refreshInvoices()
    router.push({ name: 'dashboard' })
  }
}

function resetInvoice() {
  authStore.logout()
  form.invoiceNumber = ''
  form.fullName = ''
}
</script>
