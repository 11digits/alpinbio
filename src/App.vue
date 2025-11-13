<template>
  <TopBar v-if="!isLogin" />
  <div :class="!isLogin ? 'pt-10 pb-16' : ''">
    <router-view />
  </div>
  <BottomNav v-if="!isLogin" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from './components/TopBar.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()

// computed → will update reactively whenever route changes
const isLogin = computed(() => route.path === '/' || route.path === '/login')
</script>
