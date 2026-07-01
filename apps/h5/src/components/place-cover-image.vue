<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  placePhotoFallbackHue,
  placePhotoFallbackLabel,
  resolvePlacePhoto,
} from '../utils/place-photo'
import { coverForDestination } from '../data/destination-covers'
import { lookupDestinationPhoto } from '../utils/poi-photo-registry'
import { FALLBACK_COVER } from '../utils/cover-images'

const props = defineProps<{
  name: string
  destination: string
  category?: string
  /** 本地/攻略封面，优先展示；高德图加载成功后会替换 */
  staticSrc?: string
}>()

const src = ref<string | null>(null)
const loading = ref(true)
const failed = ref(false)

const fallbackLabel = computed(() => placePhotoFallbackLabel(props.name))
const fallbackStyle = computed(() => {
  const hue = placePhotoFallbackHue(props.name, props.category)
  const isFood = props.category === 'food' || props.category === '美食'
  return {
    background: isFood
      ? `linear-gradient(135deg, hsl(${hue} 78% 58%), hsl(${(hue + 18) % 360} 72% 46%))`
      : `linear-gradient(135deg, hsl(${hue} 62% 52%), hsl(${(hue + 24) % 360} 58% 40%))`,
  }
})

function resolveLocalFallback(): string {
  return (
    props.staticSrc ??
    lookupDestinationPhoto(props.destination) ??
    coverForDestination(props.destination) ??
    FALLBACK_COVER
  )
}

async function loadPhoto() {
  const localFallback = resolveLocalFallback()
  const hasStatic = !!localFallback
  loading.value = !hasStatic
  failed.value = false
  src.value = hasStatic ? localFallback : null

  const photo = await resolvePlacePhoto(props.name, props.destination, {
    category: props.category,
  })
  if (photo) {
    src.value = photo
  } else if (!hasStatic) {
    failed.value = true
    src.value = null
  }
  loading.value = false
}

watch(
  () => [props.name, props.destination, props.staticSrc] as const,
  () => {
    void loadPhoto()
  },
  { immediate: true },
)

function onError() {
  const fallback = resolveLocalFallback()
  if (fallback && src.value !== fallback) {
    src.value = fallback
    failed.value = false
    return
  }
  failed.value = true
  src.value = null
}
</script>

<template>
  <div class="place-cover">
    <div v-if="loading && !src" class="place-cover__skeleton" aria-hidden="true" />
    <img
      v-else-if="src && !failed"
      class="place-cover__img"
      :src="src"
      :alt="name"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="onError"
    />
    <div
      v-else
      class="place-cover__fallback"
      :style="fallbackStyle"
      :aria-label="name"
    >
      {{ fallbackLabel }}
    </div>
  </div>
</template>

<style scoped>
.place-cover {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
}

.place-cover__img,
.place-cover__fallback,
.place-cover__skeleton {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.place-cover__img {
  display: block;
  object-fit: cover;
}

.place-cover__skeleton {
  background: linear-gradient(90deg, #f2f3f5 25%, #e8e9eb 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: place-cover-shimmer 1.2s ease-in-out infinite;
}

.place-cover__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: rgb(255 255 255 / 92%);
  letter-spacing: 0.05em;
}

@keyframes place-cover-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
