<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlaceCoverImage from '../components/place-cover-image.vue'
import { getCityById } from '../data/explore-pois'
import { fetchCityGuides, type XhsNote } from '../api/notes'
import { extractGuideCoverPlace } from '../utils/guide-cover'
import { ApiError } from '../api/client'
import { useTripStore } from '../stores/trip'
import {
  closeAppToast,
  showAppFailToast,
  showAppLoadingToast,
  showAppSuccessToast,
} from '../utils/app-toast'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const cityId = computed(() => String(route.params.cityId ?? ''))
const exploreCity = computed(() => getCityById(cityId.value))
const guides = ref<XhsNote[]>([])
const loading = ref(true)
const importingId = ref('')

const heroCoverPlace = computed(() => {
  const first = guides.value[0]
  if (!first) {
    return exploreCity.value.name.replace(/(市|县|区)$/, '')
  }
  return extractGuideCoverPlace(first.content, first.destination)
})

const heroDestination = computed(
  () => guides.value[0]?.destination ?? exploreCity.value.name.replace(/(市|县|区)$/, ''),
)

const cityName = computed(() => {
  const fromGuide = guides.value[0]?.destination
  if (fromGuide) {
    return fromGuide.includes('市') ? fromGuide : `${fromGuide}市`
  }
  return exploreCity.value?.name ?? cityId.value
})

const intro = computed(() => guides.value[0]?.snippet ?? '探索这座城市的攻略与路线灵感。')

onMounted(async () => {
  const dest =
    exploreCity.value?.name.replace(/(市|县|区)$/, '') ||
    cityId.value.replace(/-/g, '')
  try {
    guides.value = await fetchCityGuides(dest)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '加载城市攻略失败'
    showAppFailToast(message)
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}

function openOnMap() {
  router.push({ path: '/explore', query: { city: cityId.value } })
}

async function importGuide(note: XhsNote) {
  if (importingId.value) {
    return
  }
  importingId.value = note.id
  showAppLoadingToast('正在导入攻略…')
  try {
    const trip = await tripStore.addTripFromGuide(note)
    closeAppToast()
    showAppSuccessToast('攻略已导入，去看看你的行程吧')
    await router.push(`/trip/${trip.id}?day=1`)
  } catch (error) {
    closeAppToast()
    const message = error instanceof ApiError ? error.message : '导入失败，请稍后再试'
    showAppFailToast(message)
  } finally {
    importingId.value = ''
  }
}
</script>

<template>
  <div class="city-page">
    <header class="city-header">
      <button type="button" class="back-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1>{{ cityName }}</h1>
      <span class="header-spacer" />
    </header>

    <van-loading v-if="loading" class="page-loading" vertical>加载中...</van-loading>

    <template v-else>
      <div class="hero">
        <PlaceCoverImage
          class="hero-cover"
          :name="heroCoverPlace"
          :destination="heroDestination"
        />
        <div class="hero-mask">
          <p class="hero-city">{{ cityName }}</p>
          <p class="hero-intro">{{ intro }}</p>
        </div>
      </div>

      <section class="section">
        <div class="section-head">
          <h2>城市攻略 · {{ guides.length }}</h2>
          <button type="button" class="map-link" @click="openOnMap">在地图中查看</button>
        </div>
        <article v-for="note in guides" :key="note.id" class="guide-card">
          <PlaceCoverImage
            class="guide-cover"
            :name="extractGuideCoverPlace(note.content, note.destination)"
            :destination="note.destination"
          />
          <div class="guide-body">
            <h3>{{ note.title }}</h3>
            <p>{{ note.snippet }}</p>
            <div class="guide-meta">
              <span>{{ note.days }} 天</span>
              <span v-if="note.category">{{ note.category }}</span>
              <span>{{ note.likes }} 收藏</span>
            </div>
            <button
              type="button"
              class="import-btn"
              :disabled="importingId === note.id"
              @click="importGuide(note)"
            >
              {{ importingId === note.id ? '导入中…' : '导入行程' }}
            </button>
          </div>
        </article>
        <van-empty v-if="!guides.length" description="暂无攻略，稍后再来看看" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.city-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.city-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
}

.city-header h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.back-btn,
.header-spacer {
  width: 40px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.hero {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.hero-cover {
  width: 100%;
  height: 100%;
}

.hero-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 16px;
  background: linear-gradient(180deg, rgb(0 0 0 / 0%) 20%, rgb(0 0 0 / 55%) 100%);
  color: #fff;
}

.hero-city {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
}

.hero-intro {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  opacity: 0.92;
}

.section {
  padding: 16px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.map-link {
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
}

.guide-card {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
}

.guide-cover {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 12px;
  overflow: hidden;
}

.guide-body {
  flex: 1;
  min-width: 0;
}

.guide-body h3 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.guide-body p {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.5;
  color: #646566;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.guide-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 11px;
  color: #969799;
}

.import-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #9b7fd4, #7c5cbf);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgb(124 92 191 / 28%);
}

.import-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
