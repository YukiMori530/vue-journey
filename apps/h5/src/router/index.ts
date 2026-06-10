import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home-view.vue'
import PlanView from '@/views/plan-view.vue'
import MineView from '@/views/mine-view.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/plan', name: 'plan', component: PlanView },
    { path: '/mine', name: 'mine', component: MineView },
  ],
})

export default router
