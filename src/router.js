import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Home from './views/Home.vue'
import StartTask from './views/StartTask.vue'
import FinalizeTask from './views/FinalizeTask.vue'
import Options from './views/Options.vue'
import OtherTasks from './views/OtherTasks.vue'
import Zone from './views/Zone.vue'

const router = createRouter({
  history: createWebHistory('/ttctrack/'),
  routes: [
    { path: '/', component: Login, name: 'login' },
    { path: '/home', component: Home, name: 'home'},
    { path: '/start-task', component: StartTask, name: 'start' },
    { path: '/finalize-task', component: FinalizeTask, name: 'finalise' },
    { path: '/options', component: Options, name: 'options' },
    { path: '/other-tasks', component: OtherTasks, name: 'other' },
    { path: '/zone/:id', component: Zone, props: true, name: 'zone' }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
