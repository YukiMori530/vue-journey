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
const newItem = ref('')

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      metaStore.getMeta(props.tripId)
    }
  },
)

const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const items = computed(() => metaStore.getMeta(props.tripId).packItems)
const doneCount = computed(() => metaStore.packDoneCount(props.tripId))

function toggle(itemId: string) {
  metaStore.togglePackItem(props.tripId, itemId)
}

function addItem() {
  const text = newItem.value.trim()
  if (!text) {
    return
  }
  metaStore.addPackItem(props.tripId, text)
  newItem.value = ''
}
</script>

<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '72%' }">
    <div class="pack-sheet">
      <header class="pack-sheet__head">
        <h2>清单 · {{ doneCount }}/{{ items.length }}</h2>
        <button type="button" class="pack-sheet__preset">常用物品</button>
      </header>

      <ul class="pack-list">
        <li v-for="item in items" :key="item.id" class="pack-item">
          <button type="button" class="pack-check" @click="toggle(item.id)">
            <span :class="{ done: item.done }" />
          </button>
          <span :class="{ 'pack-item__text--done': item.done }">{{ item.text }}</span>
        </li>
      </ul>

      <div class="pack-add">
        <input
          v-model="newItem"
          type="text"
          placeholder="点击新建事项"
          @keyup.enter="addItem"
        />
        <button type="button" @click="addItem">添加</button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.pack-sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 18px;
  background: #fff;
}

.pack-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pack-sheet__head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.pack-sheet__preset {
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 12px;
  color: #646566;
  cursor: pointer;
}

.pack-list {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.pack-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
  font-size: 15px;
}

.pack-check {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.pack-check span {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px dashed #c8c9cc;
  border-radius: 50%;
}

.pack-check span.done {
  border-style: solid;
  border-color: #1989fa;
  background: #1989fa;
}

.pack-item__text--done {
  color: #969799;
  text-decoration: line-through;
}

.pack-add {
  display: flex;
  gap: 8px;
  padding-top: 12px;
}

.pack-add input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: #f7f8fa;
  font-size: 14px;
  outline: none;
}

.pack-add button {
  padding: 10px 14px;
  border: none;
  border-radius: 12px;
  background: #111;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}
</style>
