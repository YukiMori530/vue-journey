import { createRouter, createWebHistory } from 'vue-router'
import TripView from '../views/trip-view.vue'
import ExploreView from '../views/explore-view.vue'
import CreateView from '../views/create-view.vue'
import TripDetailView from '../views/trip-detail-view.vue'
import SearchView from '../views/search-view.vue'
import ImportView from '../views/import-view.vue'
import LoginView from '../views/login-view.vue'
import ProfileView from '../views/profile-view.vue'
import CollectView from '../views/collect-view.vue'
import CollectCameraView from '../views/collect-camera-view.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'trip', component: TripView, meta: { requiresAuth: true } },
    { path: '/explore', name: 'explore', component: ExploreView },
    { path: '/login', name: 'login', component: LoginView, meta: { hideTabBar: true, guestOnly: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/import', name: 'import', component: ImportView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/collect', name: 'collect', component: CollectView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/collect/camera', name: 'collect-camera', component: CollectCameraView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/create', name: 'create', component: CreateView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/trip/:id', name: 'trip-detail', component: TripDetailView, meta: { hideTabBar: true, requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return '/'
  }

  return true
})

export default router
