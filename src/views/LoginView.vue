<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-12">
    <div class="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg ring-1 ring-emerald-100">
      <div class="mb-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-white text-xl font-semibold">
          <img
            src="/alpin-logo.png"
            alt="Alpin Bio Solution"
            class="h-12 w-12 rounded-xl object-contain"
          />
        </div>
        <h1 class="mt-4 text-2xl font-semibold text-slate-900">Autentificare</h1>
        <p class="mt-2 text-sm text-slate-500">
          Conectează-te cu numărul de telefon sau adresa de email asociată contului tău.
        </p>
      </div>

      <div class="mb-4 grid gap-2 rounded-xl bg-emerald-50/60 p-3 text-left text-sm text-emerald-900 sm:grid-cols-2">
        <div class="rounded-xl border border-emerald-100/60 bg-white/70 p-3">
          <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Pasul 1</p>
          <p class="mt-1 text-slate-700 leading-snug">
            Selectează metoda preferată și introdu datele de contact pentru a primi un cod unic.
          </p>
        </div>

        <div class="rounded-xl border border-emerald-100/60 bg-white/70 p-3">
          <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Pasul 2</p>
          <p class="mt-1 text-slate-700 leading-snug">
            Introdu codul de 6 cifre primit prin SMS sau email pentru a accesa facturile și plățile.
          </p>
        </div>
      </div>


      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div v-if="!hasPendingVerification">
          <p class="text-sm font-medium text-slate-600">Alege metoda de verificare</p>
          <div class="mt-2 grid gap-3 sm:grid-cols-2">
            <button
              v-for="method in contactMethods"
              :key="method.value"
              type="button"
              :class="[
                'rounded-2xl border px-4 py-3 text-left transition',
                form.contactType === method.value
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
              ]"
              @click="selectMethod(method.value)"
            >
              <p class="font-semibold">{{ method.label }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ method.description }}</p>
            </button>
          </div>
        </div>

        <div v-if="!hasPendingVerification">
          <label class="text-sm font-medium text-slate-600" for="contact-input">{{ currentMethod.label }}</label>
          <input
            id="contact-input"
            v-model="form.contactValue"
            :type="currentMethod.inputType"
            :disabled="authStore.isLoading"
            :placeholder="currentMethod.placeholder"
            class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
            required
          />          
        </div>

        <div v-else class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>
            Am trimis un cod de acces către <strong>{{ pendingInfo.maskedContact }}</strong>.
          </p>
          <p v-if="pendingInfo.customerHint" class="mt-1 text-emerald-700">
            Cont asociat: <span class="font-semibold">{{ pendingInfo.customerHint }}</span>
          </p>
          <p v-if="pendingInfo.debugCode" class="mt-2 text-xs text-emerald-600/80">
            Cod demo pentru testare: <strong>{{ pendingInfo.debugCode }}</strong>
          </p>
        </div>

        <div v-if="hasPendingVerification" class="space-y-3">
          <label class="text-sm font-medium text-slate-600" for="verification-code">
            Cod de verificare
          </label>

          <input
            id="verification-code"
            v-model="form.verificationCode"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="000000"
            :disabled="authStore.isLoading"
            class="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.35em] text-slate-900 
                  shadow-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-100"
            required
          />

          <p v-if="authStore.codeError" class="mt-2 text-sm text-rose-600">
            {{ authStore.codeError }}
          </p>

          <div class="pt-4 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              @click="resendCode"
              :disabled="authStore.isLoading"
              class="text-slate-500 hover:text-slate-700 text-sm font-medium transition"
            >              
              Retrimite codul
            </button>

            <button
              type="button"
              @click="changeContact"
              :disabled="authStore.isLoading"
              class="text-slate-500 hover:text-slate-700 text-sm font-medium transition"
            >
              Schimbă metoda
            </button>
          </div>
        </div>
        
        <p v-if="authStore.contactError" class="mt-2 text-sm text-rose-600">{{ authStore.contactError }}</p>
        
        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-200"
          :disabled="authStore.isLoading || !canSubmit"
        >
          <svg
            v-if="authStore.isLoading"
            class="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>{{ hasPendingVerification ? 'Verifică codul' : 'Trimite codul de acces' }}</span>
        </button>
      </form>

      <div class="mt-8 text-center text-xs text-slate-400">
        <div class="grid grid-cols-4 gap-4 place-items-center mb-4">
          <a href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO" target="_blank">
            <img src="/anpc-sol.png" alt="SOL" class="w-20 opacity-90 hover:opacity-100 transition" />
          </a>
          <a href="https://anpc.ro/ce-este-sal/" target="_blank">
            <img src="/anpc-sal.png" alt="SAL" class="w-20 opacity-90 hover:opacity-100 transition" />
          </a>
          <a href="https://anpc.ro/" target="_blank">
            <img src="/anpc-logo.png" alt="ANPC" class="w-20 opacity-90 hover:opacity-100 transition" />
          </a>
          <a href="https://www.euplatesc.ro/" target="_blank">
            <img src="/logo-euplatesc.svg" alt="EuPlătesc" class="w-20 opacity-90 hover:opacity-100 transition" />
          </a>
        </div>

        Versiune aplicație {{ appVersion }}
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

const appVersion = __APP_VERSION__

const contactMethods = [
  {
    value: 'email',
    label: 'Adresă de email',
    description: 'Trimitem codul pe emailul asociat contului.',
    placeholder: 'exemplu@adresa-mail.ro',
    inputType: 'email'
  },
  {
    value: 'phone',
    label: 'Număr de telefon',
    description: 'Primești codul prin SMS.',
    placeholder: '07xx xxx xxx',
    inputType: 'tel'
  }
]

const form = reactive({
  contactType: authStore.pendingVerification?.contactType ?? 'email',
  contactValue: authStore.pendingVerification?.contactValue ?? '',
  verificationCode: ''
})

const hasPendingVerification = computed(() => Boolean(authStore.pendingVerification))
const pendingInfo = computed(() => authStore.pendingVerification ?? null)

const currentMethod = computed(() =>
  contactMethods.find((method) => method.value === form.contactType) ?? contactMethods[0]
)

const canSubmit = computed(() => {
  if (!hasPendingVerification.value) {
    return Boolean(form.contactValue.trim())
  }

  return form.verificationCode.trim().length >= 4
})

watch(
  () => form.contactValue,
  () => {
    if (authStore.contactError) {
      authStore.contactError = null
    }
  }
)

watch(
  () => form.verificationCode,
  () => {
    if (authStore.codeError) {
      authStore.codeError = null
    }
  }
)

watch(
  () => authStore.pendingVerification,
  (pending) => {
    if (pending?.contactValue) {
      form.contactValue = pending.contactValue
    }

    if (pending?.contactType) {
      form.contactType = pending.contactType
    }

    if (!pending) {
      form.verificationCode = ''
    }
  },
  { immediate: true }
)

function selectMethod(value) {
  if (hasPendingVerification.value) {
    return
  }

  form.contactType = value
  form.contactValue = ''
}

async function handleSubmit() {
  if (!hasPendingVerification.value) {
    const success = await authStore.requestVerificationCode({
      contact: form.contactValue,
      type: form.contactType
    })

    if (success) {
      form.verificationCode = ''
    }

    return
  }

  const success = await authStore.verifyCode(form.verificationCode)
  if (success) {
    router.push({ name: 'dashboard' })
  }
}

async function resendCode() {
  if (!pendingInfo.value) {
    return
  }

  await authStore.requestVerificationCode({
    contact: pendingInfo.value.contactValue,
    type: pendingInfo.value.contactType
  })
  form.verificationCode = ''
}

function changeContact() {
  authStore.resetPendingVerification()
  form.verificationCode = ''
}
</script>
