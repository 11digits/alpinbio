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

      <div class="px-6 py-6 border-t border-slate-200">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Resurse</p>
        <ul class="mt-4 space-y-2 text-sm text-slate-600">
          <li><a href="#" class="hover:text-emerald-600">Legal</a></li>
          <li><a href="#" class="hover:text-emerald-600">Contactați-ne</a></li>
        </ul>
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

            <div class="hidden lg:block w-full max-w-md">
              <label class="relative flex items-center">
                <input
                  type="search"
                  placeholder="Caută facturi, plăți sau servicii"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <MagnifyingGlassIcon class="pointer-events-none absolute right-3 h-5 w-5 text-slate-400" />
              </label>
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

          <div class="pb-4 lg:hidden">
            <label class="relative mt-3 flex items-center">
              <input
                type="search"
                placeholder="Caută facturi, plăți sau servicii"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <MagnifyingGlassIcon class="pointer-events-none absolute right-3 h-5 w-5 text-slate-400" />
            </label>
          </div>
        </div>
      </header>

      <main class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        <slot />
      </main>
    </div>
  </div>

  <nav class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white shadow-lg/5 lg:hidden">
    <ul class="flex items-center justify-around py-2">
      <li v-for="item in navigation" :key="item.to">
        <RouterLink
          :to="item.to"
          class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium"
          :class="isActive(item.to) ? 'text-emerald-600' : 'text-slate-500'"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.mobileName || item.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router'
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MagnifyingGlassIcon
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
