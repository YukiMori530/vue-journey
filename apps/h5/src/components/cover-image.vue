<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mergeCoverCandidates } from '../utils/cover-images'

const props = defineProps<{
  src: string
  alt: string
  imgClass?: string
  fallbacks?: string[]
}>()

const index = ref(0)

const candidates = computed(() =>
  mergeCoverCandidates(props.src, ...(props.fallbacks ?? [])),
)

const currentSrc = computed(
  () => candidates.value[index.value] ?? '/covers/default.jpg',
)

watch(
  () => [props.src, props.fallbacks],
  () => {
    index.value = 0
  },
  { deep: true },
)

function onError() {
  if (index.value < candidates.value.length - 1) {
    index.value += 1
  }
}
</script>

<template>
  <img
    :class="imgClass"
    :src="currentSrc"
    :alt="alt"
    loading="lazy"
    @error="onError"
  />
</template>
