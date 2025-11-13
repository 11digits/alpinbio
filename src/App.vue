<template>
  <RouterView v-slot="{ Component }">
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <component v-if="isLogin" :is="Component" />
      <AppLayout v-else>
        <component :is="Component" />
      </AppLayout>
    </div>
  </RouterView>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
</script>
