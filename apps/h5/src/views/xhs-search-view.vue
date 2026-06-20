<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import CoverImage from '../components/cover-image.vue'
import { searchNotes, type XhsNote } from '../api/notes'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const router = useRouter()
const tripStore = useTripStore()

const keyword = ref('')
const notes = ref<XhsNote[]>([])
const loading = ref(false)
const importingId = ref('')

onMounted(async () => {
  await loadNotes('')
})

async function loadNotes(query: string) {
  loading.value = true
  try {
    notes.value = await searchNotes(query)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '搜索失败'
    showToast(message)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function handleSearch() {
  loadNotes(keyword.value.trim())
}

async function importNote(note: XhsNote) {
  importingId.value = note.id
  try {
    const trip = await tripStore.addTripFromText(note.content)
    showToast('已从小红书笔记导入')
    router.push(`/trip/${trip.id}?day=1`)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '导入失败'
    showToast(message)
  } finally {
    importingId.value = ''
  }
}
</script>

<template>
  <div class="xhs-page">
    <header class="xhs-header">
      <button type="button" class="back-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="xhs-title">小红书笔记</h1>
      <span class="header-spacer" />
    </header>

    <div class="search-bar">
      <van-icon name="search" size="18" color="#969799" />
      <input
        v-model="keyword"
        type="search"
        class="search-input"
        placeholder="搜索目的地或关键词，如 成都、看海"
        @keydown.enter="handleSearch"
      />
      <button type="button" class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <p class="xhs-tip">精选旅行笔记，一键导入为可地图导航的行程</p>

    <van-loading v-if="loading" class="page-loading" vertical>搜索中...</van-loading>

    <div v-else class="note-list">
      <article v-for="note in notes" :key="note.id" class="note-card">
        <CoverImage :src="note.cover" :alt="note.title" img-class="note-cover" />
        <div class="note-body">
          <h2 class="note-title">{{ note.title }}</h2>
          <p class="note-snippet">{{ note.snippet }}</p>
          <div class="note-meta">
            <span>@{{ note.author }}</span>
            <span>{{ note.likes }} 赞</span>
            <span>{{ note.days }} 天</span>
          </div>
          <button
            type="button"
            class="import-btn"
            :disabled="importingId === note.id"
            @click="importNote(note)"
          >
            {{ importingId === note.id ? '导入中…' : '导入行程' }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.xhs-page {
  min-height: 100vh;
  padding-bottom: 24px;
  background: #fafafa;
}

.xhs-header {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 10px 8px;
  background: #fff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.xhs-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 12px 16px;
  padding: 10px 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 10px rgb(0 0 0 / 5%);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.search-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.xhs-tip {
  margin: 0 16px 12px;
  font-size: 12px;
  color: #969799;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 16px;
}

.note-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 5%);
}

.note-card :deep(.note-cover) {
  width: 96px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.note-body {
  flex: 1;
  min-width: 0;
}

.note-title {
  display: -webkit-box;
  margin: 0 0 6px;
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: #111;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.note-snippet {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #646566;
}

.note-meta {
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
  background: #ff2442;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.import-btn:disabled {
  opacity: 0.6;
}
</style>
