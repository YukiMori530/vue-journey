<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <header class="profile-nav">
    <button type="button" class="profile-nav__back" aria-label="返回" @click="emit('back')">
      <van-icon name="arrow-left" size="20" />
    </button>
    <h1 class="profile-nav__title">{{ title }}</h1>
    <div class="profile-nav__right">
      <slot name="right" />
    </div>
  </header>
</template>

<style scoped>
.profile-nav {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 10px 8px;
  background: #fff;
}

.profile-nav__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.profile-nav__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  color: #111;
}

.profile-nav__right {
  display: flex;
  justify-content: flex-end;
}
</style>
