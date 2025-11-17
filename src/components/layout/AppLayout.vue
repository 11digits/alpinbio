<template>
  <div class="min-h-screen bg-slate-50 lg:flex">
    <aside
      class="hidden lg:flex lg:w-72 xl:w-80 lg:flex-col lg:justify-between
            lg:bg-white lg:border-r lg:border-slate-200
            fixed inset-y-0 left-0"
    >
      <div class="px-6 py-8">
        <div class="flex items-center gap-3">
          <img
            src="/alpin-logo.png"
            alt="Alpin Bio Solution"
            class="h-12 w-12 rounded-xl object-contain"
          />
          <p class="text-lg font-semibold text-emerald-700">Alpin Bio Solution</p>
        </div>

        <nav class="mt-10 space-y-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
            :class="
              isActive(item.to)
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            "
          >
            <component :is="item.icon" class="h-5 w-5" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </nav>
      </div>
      <div class="px-6 py-6 border-t border-slate-100 text-xs text-slate-400">
        <div class="grid grid-cols-2 gap-4 place-items-center mb-4">
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

        <div class="text-center text-xs text-slate-400">
          Versiune aplicație {{ appVersion }}
        </div>
      </div>
    </aside>

    <div class="flex min-h-screen flex-1 flex-col lg:ml-72 xl:ml-80">
      <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div class="px-4 sm:px-6">
          <div class="flex h-16 items-center justify-between lg:justify-end w-full lg:max-w-6xl lg:mx-auto lg:px-8">

            <!-- Left side (mobile only) -->
            <div class="flex items-center gap-3 lg:hidden">
              <img
                src="/alpin-logo.png"
                alt="Alpin Bio Solution"
                class="h-10 w-10 rounded-lg object-contain"
              />
              <p class="text-base font-semibold text-slate-900">Alpin Bio Solution</p>
            </div>

            <!-- Right user block -->
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex flex-col text-right">
                <span class="text-sm font-semibold text-slate-900">[{{customerId}}] {{ customerName }}</span>
                <span class="text-xs text-slate-500">{{ customerEmail }} - {{ customerPhone }}</span>
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                {{ customerInitials }}
              </div>
              <button
                type="button"
                class="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 sm:inline-flex"
                @click="handleLogout"
              >
                Deconectare
              </button>
              <button
                type="button"
                class="inline-flex rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 sm:hidden"
                @click="handleLogout"
              >
                Ieșire
              </button>
            </div>

          </div>
        </div>
      </header>

      <main class="flex w-full max-w-full flex-1 flex-col px-4 pb-24 pt-6 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8 lg:pb-12">
        <slot />
      </main>
    </div>
  </div>

  <nav class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white shadow-inner lg:hidden box-border">
    <div class="mx-auto w-full pb-[env(safe-area-inset-bottom)] box-border">
      <ul class="grid grid-cols-3 list-none items-center py-2 p-0 m-0">
        <li v-for="item in navigation" :key="item.to" class="flex-1">
          <RouterLink
            :to="item.to"
            class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            :class="isActive(item.to) ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'"
          >
            <component :is="item.icon" class="h-5 w-5" />
            <span class="truncate">{{ item.mobileName || item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>

</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const navigation = [
  { name: 'Dashboard', mobileName: 'Acasă', to: '/dashboard', icon: HomeIcon },
  { name: 'Listă facturi', mobileName: 'Facturi', to: '/invoices', icon: DocumentTextIcon },
  { name: 'Plătește', mobileName: 'Plată', to: '/pay', icon: CreditCardIcon }
]

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appVersion = __APP_VERSION__

const customerId = computed(() => authStore.customer?.id ?? '000000')
const customerName = computed(() => authStore.customer?.name ?? 'Client Alpin Bio')
const customerEmail = computed(() => authStore.customer?.email ?? 'Email indisponibil')
const customerPhone = computed(() => authStore.customer?.phone ?? 'Telefon indisponibil')
const customerInitials = computed(() => {
  const source = authStore.customer?.name ?? authStore.customer?.email ?? 'AB'
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'AB'
})

const isActive = (target) => {
  if (target === '/pay' && route.name === 'invoice-pay') {
    return true
  }

  return route.path === target || route.path.startsWith(`${target}/`)
}

function handleLogout() {
  authStore.logout()
  router.replace({ name: 'login' })
}
</script>
