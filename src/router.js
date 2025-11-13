import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import InvoicesView from '@/views/InvoicesView.vue'
import PaymentView from '@/views/PaymentView.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', name: 'login', component: LoginView, alias: ['/login'] },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/invoices', name: 'invoices', component: InvoicesView },
    { path: '/pay/:id', name: 'invoice-pay', component: PaymentView },
    { path: '/pay', name: 'pay', component: PaymentView }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
