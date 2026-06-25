<script setup lang="ts">
import { computed } from 'vue'
import type { TripStop } from '../types/trip'
import PlaceCoverImage from './place-cover-image.vue'
import { formatStopDisplayName } from '../utils/display-stop-name'

const props = defineProps<{
  show: boolean
  stop: TripStop | null
  index: number
  destination: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  edit: []
}>()

const displayName = computed(() =>
  props.stop ? formatStopDisplayName(props.stop.name, props.destination) : '',
)

const tips = computed(() => props.stop?.tips?.trim() ?? '')

function close() {
  emit('update:show', false)
}
</script>

<template>
  <van-popup
    :show="show"
    round
    position="bottom"
    :style="{ maxHeight: '78vh' }"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="stop" class="stop-detail">
      <PlaceCoverImage
        class="stop-detail__hero"
        :name="stop.name"
        :destination="destination"
        :category="stop.category"
      />
      <div class="stop-detail__body">
        <div class="stop-detail__head">
          <h3>{{ index + 1 }}. {{ displayName }}</h3>
          <span v-if="stop.categoryLabel" class="stop-tag">{{ stop.categoryLabel }}</span>
        </div>
        <p v-if="stop.startTime && stop.endTime" class="stop-detail__time">
          {{ stop.startTime }} - {{ stop.endTime }}
        </p>
        <p class="stop-detail__desc">{{ stop.description }}</p>
        <p v-if="tips" class="stop-detail__tips">{{ tips }}</p>
        <div class="stop-detail__actions">
          <van-button round block type="primary" @click="emit('edit')">调整这一站</van-button>
          <van-button round block plain @click="close">关闭</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.stop-detail__hero {
  width: 100%;
  height: 180px;
  border-radius: 16px 16px 0 0;
}

.stop-detail__body {
  padding: 16px 16px 24px;
}

.stop-detail__head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.stop-detail__head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111;
}

.stop-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 11px;
  color: #646566;
}

.stop-detail__time {
  margin: 0 0 10px;
  font-size: 13px;
  color: #969799;
}

.stop-detail__desc {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.65;
  color: #323233;
}

.stop-detail__tips {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7f8fa;
  font-size: 13px;
  line-height: 1.55;
  color: #646566;
}

.stop-detail__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
