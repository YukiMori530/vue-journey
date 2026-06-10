<script setup lang="ts">
const trips = [
  { id: 1, title: '成都 3 日游', days: 3 },
  { id: 2, title: '杭州 2 日游', days: 2 },
]
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的行程" fixed placeholder />

    <div class="page-body">
      <van-empty v-if="trips.length === 0" description="还没有行程" />

      <van-cell-group v-else inset>
        <van-cell
          v-for="trip in trips"
          :key="trip.id"
          :title="trip.title"
          :label="`${trip.days} 天`"
          is-link
        />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.page-body {
  padding: 8px 0 24px;
}
</style>
