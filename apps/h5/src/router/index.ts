import { createRouter, createWebHistory } from 'vue-router'
import TripView from '../views/trip-view.vue'
import ExploreView from '../views/explore-view.vue'
import CreateView from '../views/create-view.vue'
import TripDetailView from '../views/trip-detail-view.vue'
import SearchView from '../views/search-view.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'trip', component: TripView },
    { path: '/explore', name: 'explore', component: ExploreView },
    { path: '/search', name: 'search', component: SearchView, meta: { hideTabBar: true } },
    { path: '/create', name: 'create', component: CreateView, meta: { hideTabBar: true } },
    { path: '/trip/:id', name: 'trip-detail', component: TripDetailView, meta: { hideTabBar: true } },
  ],
})

export default router
