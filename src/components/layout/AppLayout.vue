<template>
  <div class="min-h-screen bg-slate-50 lg:flex">
    <aside class="hidden lg:flex lg:w-72 xl:w-80 lg:flex-col lg:justify-between lg:bg-white lg:border-r lg:border-slate-200">
      <div class="px-6 py-8">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white text-xl font-semibold">
            AB
          </div>
          <div>
            <p class="text-sm font-medium text-emerald-700">Alpin Bio Solution</p>
            <p class="text-xs text-slate-500">plati.alpinbio.ro</p>
          </div>
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
    </aside>

    <div class="flex min-h-screen flex-1 flex-col">
      <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <div class="flex items-center gap-3 lg:hidden">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white text-lg font-semibold">
                AB
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">Alpin Bio Solution</p>
                <p class="text-xs text-slate-500">plati.alpinbio.ro</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="hidden sm:flex flex-col text-right">
                <span class="text-sm font-semibold text-slate-900">Client Premium</span>
                <span class="text-xs text-slate-500">client@alpinbio.ro</span>
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                CP
              </div>
            </div>
          </div>

        </div>
      </header>

      <main class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        <slot />
      </main>
    </div>
  </div>

  <nav class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white shadow-lg/5 lg:hidden">
    <div class="mx-auto w-full px-4 pb-[env(safe-area-inset-bottom)]">
      <ul class="grid grid-cols-3 list-none items-center gap-1 py-2">
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
import { useRoute, RouterLink } from 'vue-router'
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'

const navigation = [
  { name: 'Dashboard', mobileName: 'Acasă', to: '/dashboard', icon: HomeIcon },
  { name: 'Listă facturi', mobileName: 'Facturi', to: '/invoices', icon: DocumentTextIcon },
  { name: 'Plătește', mobileName: 'Plată', to: '/pay', icon: CreditCardIcon }
]

const route = useRoute()
const isActive = (target) => {
  if (target === '/pay' && route.name === 'invoice-pay') {
    return true
  }

  return route.path === target || route.path.startsWith(`${target}/`)
}
</script>
