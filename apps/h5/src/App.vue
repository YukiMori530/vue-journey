<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppTabBar from './components/app-tab-bar.vue'
import CreateActionSheet from './components/create-action-sheet.vue'

const route = useRoute()
const showCreateSheet = ref(false)

const showTabBar = computed(() => !route.meta.hideTabBar)

function openCreateSheet() {
  showCreateSheet.value = true
}
</script>

<template>
  <div class="app-layout" :class="{ 'no-tabbar': !showTabBar }">
    <RouterView />

    <CreateActionSheet v-model:show="showCreateSheet" />

    <AppTabBar
      v-if="showTabBar"
      :sheet-open="showCreateSheet"
      @open-create="openCreateSheet"
    />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  padding-bottom: calc(68px + env(safe-area-inset-bottom));
  background: #f5f6f7;
}

.app-layout.no-tabbar {
  padding-bottom: 0;
}
</style>
