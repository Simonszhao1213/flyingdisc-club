<template>
  <div id="app">
    <!-- Logo watermark top-right -->
    <div class="logo-watermark">
      <img src="/logo.png" alt="" />
    </div>

    <!-- Page content -->
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Tab bar -->
    <van-tabbar v-if="showTabbar" route fixed placeholder safe-area-inset-bottom class="tabbar">
      <van-tabbar-item to="/home" class="tab-item">
        <template #icon><span class="tab-icon">🏠</span></template>
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/notes" v-if="canSeeNotes" class="tab-item">
        <template #icon><span class="tab-icon">📝</span></template>
        笔记
      </van-tabbar-item>
      <van-tabbar-item to="/events" v-if="canSeeEvents" class="tab-item">
        <template #icon><span class="tab-icon">📅</span></template>
        活动
      </van-tabbar-item>
      <van-tabbar-item to="/admin" v-if="isAdmin" class="tab-item">
        <template #icon><span class="tab-icon">⚡</span></template>
        审批
      </van-tabbar-item>
      <van-tabbar-item to="/profile" class="tab-item">
        <template #icon><span class="tab-icon">👤</span></template>
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
/* Logo watermark */
.logo-watermark {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 999;
  width: 48px;
  height: 48px;
  pointer-events: none;
}

.logo-watermark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 16px rgba(255, 107, 53, 0.5));
  opacity: 0.9;
}

/* Tab bar */
.tabbar {
  backdrop-filter: blur(24px) saturate(1.2) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.2) !important;
}

.tab-item {
  font-size: 11px !important;
}

.tab-icon {
  font-size: 22px;
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.35s var(--ease-out);
}
.slide-enter-from { opacity: 0; transform: translateX(30px); }
.slide-leave-to { opacity: 0; transform: translateX(-30px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
