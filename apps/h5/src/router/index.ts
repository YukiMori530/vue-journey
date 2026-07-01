import { createRouter, createWebHistory } from 'vue-router'
import TripView from '../views/trip-view.vue'
import ExploreView from '../views/explore-view.vue'
import ExploreCityView from '../views/explore-city-view.vue'
import CreateView from '../views/create-view.vue'
import CreatePlanView from '../views/create-plan-view.vue'
import PlanGeneratingView from '../views/plan-generating-view.vue'
import TripDetailView from '../views/trip-detail-view.vue'
import SearchView from '../views/search-view.vue'
import ImportView from '../views/import-view.vue'
import XhsSearchView from '../views/xhs-search-view.vue'
import LoginView from '../views/login-view.vue'
import ProfileView from '../views/profile-view.vue'
import ProfileAccountView from '../views/profile-account-view.vue'
import ProfileEditView from '../views/profile-edit-view.vue'
import ProfileTrashView from '../views/profile-trash-view.vue'
import ProfileFeedbackView from '../views/profile-feedback-view.vue'
import ProfileAboutView from '../views/profile-about-view.vue'
import ProfileVersionView from '../views/profile-version-view.vue'
import CollectView from '../views/collect-view.vue'
import CollectCameraView from '../views/collect-camera-view.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'trip', component: TripView, meta: { requiresAuth: true } },
    { path: '/explore', name: 'explore', component: ExploreView },
    { path: '/explore/city/:cityId', name: 'explore-city', component: ExploreCityView, meta: { hideTabBar: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { hideTabBar: true, guestOnly: true, hideAssistant: true } },
    { path: '/search', name: 'search', component: SearchView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/import', name: 'import', component: ImportView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/import/xhs', name: 'xhs-search', component: XhsSearchView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile/account', name: 'profile-account', component: ProfileAccountView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile/edit', name: 'profile-edit', component: ProfileEditView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile/trash', name: 'profile-trash', component: ProfileTrashView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile/feedback', name: 'profile-feedback', component: ProfileFeedbackView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile/about', name: 'profile-about', component: ProfileAboutView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/profile/version', name: 'profile-version', component: ProfileVersionView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/collect', name: 'collect', component: CollectView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/collect/camera', name: 'collect-camera', component: CollectCameraView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/create', name: 'create', component: CreateView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/create/plan', name: 'create-plan', component: CreatePlanView, meta: { hideTabBar: true, requiresAuth: true } },
    { path: '/create/generating', name: 'plan-generating', component: PlanGeneratingView, meta: { hideTabBar: true, requiresAuth: true } },
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
