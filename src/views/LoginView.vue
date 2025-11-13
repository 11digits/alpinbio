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

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="text-sm font-medium text-slate-600" for="invoice">Nr factură existentă</label>
          <input
            id="invoice"
            v-model="form.invoiceNumber"
            type="text"
            required
            placeholder="Introduceți numărul facturii"
            class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label class="text-sm font-medium text-slate-600" for="phone">Nr telefon</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            required
            placeholder="Introduceți numărul de telefon"
            class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label class="text-sm font-medium text-slate-600" for="code">Cod SMS</label>
          <input
            id="code"
            v-model="form.smsCode"
            type="text"
            required
            placeholder="Introduceți codul SMS"
            class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div class="flex items-center justify-between text-sm">
          <button type="button" class="font-semibold text-emerald-600 hover:text-emerald-700" @click="requestCode">
            Re-trimite cod SMS
          </button>
          <span class="text-slate-400">Necesită verificare în 2 pași</span>
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          Autentificare
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
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({
  invoiceNumber: '',
  phone: '',
  smsCode: ''
})

function handleLogin() {
  router.push('/dashboard')
}

function requestCode() {
  window.alert('Un nou cod a fost trimis către numărul de telefon introdus.')
}
</script>
