<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTripMetaStore } from '../stores/trip-meta'

const props = defineProps<{
  tripId: number
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const metaStore = useTripMetaStore()
const content = ref('')

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      content.value = metaStore.getMeta(props.tripId).note
    }
  },
  { immediate: true },
)

const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

function save() {
  metaStore.saveNote(props.tripId, content.value)
  visible.value = false
}
</script>

<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '72%' }">
    <div class="note-sheet">
      <header class="note-sheet__head">
        <h2>便签</h2>
        <button type="button" class="note-sheet__done" @click="save">完成</button>
      </header>
      <textarea
        v-model="content"
        class="note-sheet__area"
        placeholder="记录你的旅行想法"
      />
    </div>
  </van-popup>
</template>

<style scoped>
.note-sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff9e6;
}

.note-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 8px;
}

.note-sheet__head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.note-sheet__done {
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.note-sheet__area {
  flex: 1;
  width: 100%;
  padding: 12px 18px 24px;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.7;
  color: #323233;
  resize: none;
  outline: none;
}
</style>
