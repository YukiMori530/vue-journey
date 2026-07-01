<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { showToast } from 'vant'
import { listStaticExploreCities } from '../utils/explore-city-registry'
import type { ExploreCity } from '../data/explore-pois'
import {
  ensureExploreCity,
  resolveCityIdFromDestination,
} from '../utils/explore-city-registry'
import { citySlugFromDestination, normalizeDestinationName } from '../utils/city-slug'
import type { ExploreHotCity } from '../api/notes'

const show = defineModel<boolean>('show', { default: false })

const props = defineProps<{
  hotCities?: ExploreHotCity[]
}>()

const emit = defineEmits<{
  select: [city: ExploreCity]
}>()

const keyword = ref('')
const searching = ref(false)

const staticOptions = computed(() => listStaticExploreCities())

const hotOptions = computed(() => {
  const list = props.hotCities ?? []
  return list.map((city) => ({
    id: city.id,
    name: city.name,
    source: 'hot' as const,
  }))
})

const filteredStatic = computed(() => {
  const q = keyword.value.trim()
  if (!q) {
    return staticOptions.value
  }
  return staticOptions.value.filter((city) => city.name.includes(q))
})

const filteredHot = computed(() => {
  const q = keyword.value.trim()
  if (!q) {
    return hotOptions.value
  }
  return hotOptions.value.filter((city) => city.name.includes(q))
})

watch(show, (visible) => {
  if (!visible) {
    keyword.value = ''
  }
})

async function pickStatic(city: ExploreCity) {
  emit('select', city)
  show.value = false
}

async function pickHot(city: { id: string; name: string }) {
  const dest = normalizeDestinationName(city.name)
  const cityId = city.id || citySlugFromDestination(dest)
  const resolved = await ensureExploreCity(cityId, dest)
  emit('select', resolved)
  show.value = false
}

async function searchAndSelect() {
  const q = keyword.value.trim()
  if (!q || searching.value) {
    return
  }

  searching.value = true
  try {
    const dest = normalizeDestinationName(q)
    const cityId = resolveCityIdFromDestination(dest)
    const resolved = await ensureExploreCity(cityId, dest)
    emit('select', resolved)
    show.value = false
    showToast(`已切换到${resolved.name}`)
  } catch {
    showToast('未找到该城市，请换个关键词')
  } finally {
    searching.value = false
  }
}
</script>

<template>
  <van-popup v-model:show="show" position="bottom" round :style="{ height: '62vh' }">
    <div class="city-picker">
      <h2 class="city-picker__title">选择探索城市</h2>
      <van-search
        v-model="keyword"
        placeholder="搜索城市，如三亚、成都"
        shape="round"
        show-action
        @search="searchAndSelect"
      >
        <template #action>
          <button type="button" class="search-btn" :disabled="searching" @click="searchAndSelect">
            {{ searching ? '搜索中' : '搜索' }}
          </button>
        </template>
      </van-search>

      <div class="city-picker__list">
        <section v-if="filteredHot.length" class="city-section">
          <h3 class="city-section__label">热门城市</h3>
          <button
            v-for="city in filteredHot"
            :key="`hot-${city.id}`"
            type="button"
            class="city-item"
            @click="pickHot(city)"
          >
            {{ city.name }}
          </button>
        </section>

        <section class="city-section">
          <h3 class="city-section__label">全部城市</h3>
          <button
            v-for="city in filteredStatic"
            :key="city.id"
            type="button"
            class="city-item"
            @click="pickStatic(city)"
          >
            {{ city.name }}
          </button>
        </section>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.city-picker {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 16px 0;
}

.city-picker__title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
}

.search-btn {
  padding: 0 4px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.city-picker__list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.city-section {
  margin-bottom: 16px;
}

.city-section__label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #969799;
}

.city-item {
  display: block;
  width: 100%;
  padding: 14px 4px;
  border: none;
  border-bottom: 1px solid #f2f3f5;
  background: transparent;
  font-size: 15px;
  color: #323233;
  text-align: left;
  cursor: pointer;
}
</style>
