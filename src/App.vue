<template>
  <div id="app">
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <van-tabbar v-if="showTabbar" route fixed placeholder safe-area-inset-bottom class="tabbar">
      <van-tabbar-item to="/home" icon-prefix="icon" class="tab-item">
        <template #icon>
          <span class="iconfont-home">🏠</span>
        </template>
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/notes" icon-prefix="icon" v-if="canSeeNotes" class="tab-item">
        <template #icon>
          <span class="iconfont-home">📝</span>
        </template>
        笔记
      </van-tabbar-item>
      <van-tabbar-item to="/events" icon-prefix="icon" v-if="canSeeEvents" class="tab-item">
        <template #icon>
          <span class="iconfont-home">📅</span>
        </template>
        活动
      </van-tabbar-item>
      <van-tabbar-item to="/admin" icon-prefix="icon" v-if="isAdmin" class="tab-item">
        <template #icon>
          <span class="iconfont-home">⚡</span>
        </template>
        审批
      </van-tabbar-item>
      <van-tabbar-item to="/profile" icon-prefix="icon" class="tab-item">
        <template #icon>
          <span class="iconfont-home">👤</span>
        </template>
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

const showTabbar = computed(() => userStore.isLoggedIn && userStore.user?.status === 'approved')
const isAdmin = computed(() => ['captain', 'training_admin', 'match_admin', 'trial_admin'].includes(userStore.user?.role))
const canSeeNotes = computed(() => true)
const canSeeEvents = computed(() => userStore.user?.role !== 'guest')

const transitionName = computed(() => route.meta?.transition || 'slide')
</script>

<style>
/* Global styles are in main.css */
.tabbar {
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
}

.tab-item {
  font-size: 11px !important;
}

.iconfont-home {
  font-size: 20px;
}

/* Page transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s var(--ease-out);
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
